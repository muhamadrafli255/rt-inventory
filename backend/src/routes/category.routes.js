const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/category.controller");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");

const authenticate = require("../middlewares/auth.middleware");
const {
  requirePermission,
} = require("../middlewares/permission.middleware");

router.use(authenticate);

router.get(
  "/",
  requirePermission("categories.view"),
  asyncHandler(categoryController.index)
);

router.get(
  "/:id",
  validate(categoryIdSchema),
  requirePermission("categories.view"),
  asyncHandler(categoryController.show)
);

router.post(
  "/",
  validate(createCategorySchema),
  requirePermission("categories.create"),
  asyncHandler(categoryController.store)
);

router.patch(
  "/:id",
  validate(updateCategorySchema),
  requirePermission("categories.update"),
  asyncHandler(categoryController.update)
);

router.delete(
  "/:id",
  validate(categoryIdSchema),
  requirePermission("categories.delete"),
  asyncHandler(categoryController.destroy)
);

module.exports = router;