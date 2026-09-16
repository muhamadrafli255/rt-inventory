const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
} = require("../middlewares/permission.middleware");

const router = express.Router();

router.get(
  "/items-view",
  authMiddleware,
  requirePermission("items.view"),
  (req, res) => {
    res.json({
      success: true,
      message: "Kamu memiliki permission items.view",
    });
  }
);

router.post(
  "/items-create",
  authMiddleware,
  requirePermission("items.create"),
  (req, res) => {
    res.json({
      success: true,
      message: "Kamu memiliki permission items.create",
    });
  }
);

router.get(
  "/any-permission",
  authMiddleware,
  requireAnyPermission([
    "items.update",
    "items.delete",
  ]),
  (req, res) => {
    res.json({
      success: true,
      message: "Kamu memiliki salah satu permission",
    });
  }
);

router.get(
  "/all-permissions",
  authMiddleware,
  requireAllPermissions([
    "items.view",
    "items.update",
  ]),
  (req, res) => {
    res.json({
      success: true,
      message: "Kamu memiliki semua permission",
    });
  }
);

module.exports = router;