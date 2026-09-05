const User = require("../models/user-model")
const ApiResponse = require('../utils/api-response')
const ApiError = require('../utils/api-error')
const asyncHandler = require('../utils/asyn-handler')
const { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent } = require("../utils/mail")
const jwt = require("jsonwebtoken")
const crypto = require('crypto')

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
}

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAcessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating the token"
        )
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists", [])
    }
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    })
    const { unhashed, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user?.email,
            subject: "Please Verify your email",
            mailgenContent: emailVerificationMailgenContent(user.username,
                `${process.env.CLIENT_URL}/verify-email/${unhashed}`),
        })
    } catch (error) {
        // Roll back the created user if the verification email fails to send,
        // otherwise we're left with an unverifiable account.
        await User.findByIdAndDelete(user._id);
        throw new ApiError(500, "Something went wrong while sending the verification email")
    }

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }
    return res.status(201).json(
        new ApiResponse(201,
            { user: createdUser },
            "User registered successfully and verification Email has been sent on your Email"
        )
    )
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    if (!password) {
        throw new ApiError(400, "Password is required")
    }
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(400, "User doesn't exist");
    }
    const isPassValid = await user.isPasswordCorrect(password);

    if (!isPassValid) {
        throw new ApiError(400, "Email or password is wrong")
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        }, {
        returnDocument: "after"
    }
    )

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {}, "User logged out")
        )
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200,
                req.user,
                "current user Fetched succesfully"
            )
        )

})
const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params

    if (!verificationToken) {
        throw new ApiError(400, "Email verification token is missing")
    }

    let hashedToken = crypto.createHash('sha256')
        .update(verificationToken)
        .digest('hex')

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    })
    if (!user) {
        throw new ApiError(400, "Email verification token is invalid or has expired")
    }
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                {
                    isEmailVerified: true
                },
                "Email is Verified",
            )
        )
})

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    if (user.isEmailVerified) {
        throw new ApiError(
            409, "Email is already Verified"
        )
    }
    const { unhashed, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user?.email,
            subject: "Please Verify your email",
            mailgenContent: emailVerificationMailgenContent(user.username,
                `${process.env.CLIENT_URL}/verify-email/${unhashed}`),
        })
    } catch (error) {
        throw new ApiError(500, "Something went wrong while sending the verification email")
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "Mail has been sent to your Email id")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if (incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Refresh token is Expired")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id)
        user.refreshToken = newRefreshToken;
        await user.save();

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Acess token refreshed"
                )
            )

    }
    catch (error) {
        throw new ApiError(401, "No Refresh Token found")
    }
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404,
            "User doesnt exist"
        )
    }
    const { unhashed, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    try {
        await sendEmail({
            email: user?.email,
            subject: "Password Reset",
            mailgenContent: forgotPasswordMailgenContent(user.username,
                `${process.env.CLIENT_URL}/reset-password/${unhashed}`),
        })
    } catch (error) {
        // Don't leave the user thinking a reset link is on its way when it
        // never sent — clear the token so a retry generates a fresh one.
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({ validateBeforeSave: false })
        throw new ApiError(500, "Something went wrong while sending the password reset email")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,
                {},
                "Password reset email has been sent to you email id "
            )
        )
})

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params
    const { newPassword } = req.body
    let hashedToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })
    if (!user) {
        throw new ApiError(400, "Token expired")
    }
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })
    return res.status(200).
        json(
            new ApiResponse(200,
                {},
                "Password reset successfully"
            )
        )
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isPassValid = await user.isPasswordCorrect(oldPassword);

    if (!isPassValid) {
        throw new ApiError(400, "Invalid old password");
    }
    user.password = newPassword

    await user.save({ validateBeforeSave: false })
    return res.status(200)
        .json(
            new ApiResponse(200,
                {},
                "Password changed Succesfully"
            )
        )

})



module.exports = {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPassword,
    resetForgotPassword,
    changeCurrentPassword
}
