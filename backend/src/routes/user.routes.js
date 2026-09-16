const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");
const authenticate = require("../middlewares/auth.middleware");

const {
  userIdSchema,
  createUserSchema,
  updateUserSchema,
  userListSchema,
} = require("../validators/user.validator");

function requireAdmin(req, res, next) {
  if (req.auth?.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya Admin yang dapat mengelola data warga.",
    });
  }
  next();
}

router.use(authenticate);
router.use(requireAdmin);

router.get(
  "/",
  validate(userListSchema),
  asyncHandler(userController.index)
);

router.get(
  "/:id",
  validate(userIdSchema),
  asyncHandler(userController.show)
);

router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(userController.store)
);

router.put(
  "/:id",
  validate(updateUserSchema),
  asyncHandler(userController.update)
);

router.patch(
  "/:id",
  validate(updateUserSchema),
  asyncHandler(userController.update)
);

router.delete(
  "/:id",
  validate(userIdSchema),
  asyncHandler(userController.destroy)
);

module.exports = router;
