const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/is_auth");
const AuthController = require("../controllers/auth");
const User = require("../models/user");
const { check, body, param } = require("express-validator"); //check is the function used for adding validation check and validationResult is the function to check the results
router.get("/signup", AuthController.getSignUpPage);
router.post(
  "/postSignUp",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("User with this Email Already exists "); //we will send error like this because we are in then block and if there will be user exists we will not have to complete this promise we will reject
          }
        });
      }), //the email already exits must be a validation so must be implemented here in tha custom block  not in controller
    body(
      "password",
      "Enter valid password with min 8 characters and must be alphanumeric  "
    )
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password and Confirm Password must be same");
        }
        return true;
      }),
  ],
  AuthController.postSignUp
);
router.get("/login", AuthController.getLoginPage);
router.post(
  "/postlogin",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a valid Email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("User with this Email does not exists");
          }
        });
      }),
    body(
      "password",
      "Enter valid password with min 8 characters and must be alphanumeric  "
    )
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
  ],
  AuthController.postLogin
);
router.get("/reset", AuthController.getResetPage);
router.post("/postReset", AuthController.postReset);
router.get("/reset/:token", AuthController.getNewPassword);
router.post("/postNewPassword", AuthController.postNewPassword);
router.post("/logout", AuthController.postLogOut);

module.exports = router;
