const {body}=require("express-validator");
const {AvailableUserRole}=require("../utils/constants")
const userRegisterValidator=()=>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid")
        .normalizeEmail(),

        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLowercase()
        .withMessage("Username must be in lower case")
        .isLength({min:3})
        .withMessage("Username must be at least 3 characters"),

        body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({min:8})
        .withMessage("Password must be at least 8 characters"),

        body("fullname")
        .optional()
        .trim()
    ]
}

const userLoginValidator=()=>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid")
        .normalizeEmail(),

        body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
    ]
}

const userChangeCurrentPasswordValidator=()=>{
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old password required"),
        body("newPassword")
            .notEmpty()
            .withMessage("New Password is required")
    ]
}

const userForgotPasswordValidator=()=>{
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
    ]
}

const userResetPasswordValidator=()=>{
    return [
        body('newPassword')
            .notEmpty()
            .withMessage('Password is required')
    ]
}

const createProjectValidator=()=>{
    return [
        body("name")
            .notEmpty()
            .withMessage("Name is required"),
        body("description")
            .optional()
    ]
}

const addMembersToProjectValidator=()=>{
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("role")
            .notEmpty()
            .withMessage("Role is required")
            .isIn(AvailableUserRole)
            .withMessage("Role is invalid")
    ]
}

module.exports={
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetPasswordValidator,
    createProjectValidator,
    addMembersToProjectValidator
}