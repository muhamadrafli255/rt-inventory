const express = require("express");

const router = express.Router();

const loanController = require("../controllers/loan.controller");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const {
  loanIdSchema,
  createLoanSchema,
  loanListSchema,
  rejectLoanSchema,
} = require("../validators/loan.validator");

const authenticate = require("../middlewares/auth.middleware");
const {
  requirePermission,
} = require("../middlewares/permission.middleware");

router.use(authenticate);

// Melihat daftar peminjaman
router.get(
  "/",
  validate(loanListSchema),
  requirePermission("loans.view"),
  asyncHandler(loanController.index)
);

// Melihat detail peminjaman
router.get(
  "/:id",
  validate(loanIdSchema),
  requirePermission("loans.view"),
  asyncHandler(loanController.show)
);

// Membuat pengajuan
router.post(
  "/",
  validate(createLoanSchema),
  requirePermission("loans.create"),
  asyncHandler(loanController.store)
);

// Menyetujui peminjaman
router.patch(
  "/:id/approve",
  validate(loanIdSchema),
  requirePermission("loans.approve"),
  asyncHandler(loanController.approve)
);

// Menolak peminjaman
router.patch(
  "/:id/reject",
  validate(rejectLoanSchema),
  requirePermission("loans.reject"),
  asyncHandler(loanController.reject)
);

// Menandai barang sudah diserahkan
router.patch(
  "/:id/borrow",
  validate(loanIdSchema),
  requirePermission("loans.update"),
  asyncHandler(loanController.borrow)
);

// Memproses pengembalian
router.patch(
  "/:id/return",
  validate(loanIdSchema),
  requirePermission("loans.return"),
  asyncHandler(loanController.returnItem)
);

// Membatalkan peminjaman
router.patch(
  "/:id/cancel",
  validate(loanIdSchema),
  requirePermission("loans.cancel"),
  asyncHandler(loanController.cancel)
);

module.exports = router;