const express = require("express");

const router = express.Router();

const itemController = require("../controllers/item.controller");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const {
  itemIdSchema,
  createItemSchema,
  updateItemSchema,
  itemListSchema,
} = require("../validators/item.validator");

const authenticate = require("../middlewares/auth.middleware");
const {
  requirePermission,
} = require("../middlewares/permission.middleware");

router.use(authenticate);

router.get(
  "/",
  validate(itemListSchema),
  requirePermission("items.view"),
  asyncHandler(itemController.index)
);

router.get(
  "/:id",
  validate(itemIdSchema),
  requirePermission("items.view"),
  asyncHandler(itemController.show)
);

router.post(
  "/",
  validate(createItemSchema),
  requirePermission("items.create"),
  asyncHandler(itemController.store)
);

router.patch(
  "/:id",
  validate(updateItemSchema),
  requirePermission("items.update"),
  asyncHandler(itemController.update)
);

router.delete(
  "/:id",
  validate(itemIdSchema),
  requirePermission("items.delete"),
  asyncHandler(itemController.destroy)
);

module.exports = router;