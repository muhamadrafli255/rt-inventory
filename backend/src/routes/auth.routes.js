const express = require("express");

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");

const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login)
);

router.post(
  "/refresh",
  asyncHandler(authController.refresh)
);

router.post(
  "/logout",
  authMiddleware,
  asyncHandler(authController.logout)
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(authController.me)
);

router.get(
  "/permissions",
  authMiddleware,
  asyncHandler(authController.permissions)
);

module.exports = router;