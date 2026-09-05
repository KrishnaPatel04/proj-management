const Router = require('express')

const { registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPassword,
    resetForgotPassword,
    changeCurrentPassword } = require('../controllers/auth-controllers');
const validate = require("../middlewares/validator-middle")
const { userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetPasswordValidator } = require("../validators/index")
const { verifyJWT } = require('../middlewares/auth-middleware')

const router = Router();

//unsecured route
router.route('/register').post(userRegisterValidator(),
    validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, login);
router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/forgot-password').post(userForgotPasswordValidator(), validate, forgotPassword);
router.route('/reset-password/:resetToken')
    .post(userResetPasswordValidator(), validate, resetForgotPassword)


//secure route
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/change-password').post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route('/resend-email-verification')
    .post(verifyJWT, resendEmailVerification);

//export default router;
module.exports = router
