const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

const {
  requirePermission,
} = require("../middlewares/permission.middleware");

router.use(authenticate);

router.get(
  "/",
  requirePermission("dashboard.view"),
  asyncHandler(dashboardController.index)
);

router.get(
  "/summary",
  requirePermission("dashboard.view"),
  asyncHandler(dashboardController.summary)
);

router.get(
  "/loan-statistics",
  requirePermission("dashboard.view"),
  asyncHandler(dashboardController.loanStatistics)
);

router.get(
  "/popular-items",
  requirePermission("dashboard.view"),
  asyncHandler(dashboardController.popularItems)
);

router.get(
  "/recent-loans",
  requirePermission("dashboard.view"),
  asyncHandler(dashboardController.recentLoans)
);

module.exports = router;