const loanService = require("../services/loan.service");
const { success, error } = require("../utils/apiResponse");

async function index(req, res) {
  const result = await loanService.getLoans({
    ...req.validated.query,
    userId: req.auth.userId,
    role: req.auth.role,
  });

  return success(
    res,
    result,
    "Daftar peminjaman berhasil diambil"
  );
}

async function show(req, res) {
  const loan = await loanService.getLoanById(
    req.validated.params.id,
    req.auth.userId,
    req.auth.role
  );

  if (!loan) {
    return error(res, "Peminjaman tidak ditemukan", 404);
  }

  return success(
    res,
    loan,
    "Detail peminjaman berhasil diambil"
  );
}

async function store(req, res) {
  try {
    const loan = await loanService.createLoan(
      req.auth.userId,
      req.validated.body
    );

    return success(
      res,
      loan,
      "Pengajuan peminjaman berhasil dibuat",
      201
    );
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }

    throw err;
  }
}

async function approve(req, res) {
  try {
    const loan = await loanService.approveLoan(
      req.validated.params.id
    );

    return success(
      res,
      loan,
      "Peminjaman berhasil disetujui"
    );
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }

    throw err;
  }
}

async function reject(req, res) {
  try {
    const loan = await loanService.rejectLoan(
      req.validated.params.id,
      req.validated.body.rejectionReason
    );

    return success(
      res,
      loan,
      "Peminjaman berhasil ditolak"
    );
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }

    throw err;
  }
}

async function borrow(req, res) {
  try {
    const loan = await loanService.markAsBorrowed(
      req.validated.params.id
    );

    return success(
      res,
      loan,
      "Barang berhasil diserahkan dan status menjadi DIPINJAM"
    );
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }

    throw err;
  }
}

async function returnItem(req, res) {
  try {
    const loan = await loanService.returnLoan(
      req.validated.params.id
    );

    return success(
      res,
      loan,
      "Barang berhasil dikembalikan"
    );
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }

    throw err;
  }
}

async function cancel(req, res) {
  try {
    const loan = await loanService.cancelLoan(
      req.validated.params.id,
      req.auth.userId,
      req.auth.role
    );

    return success(
      res,
      loan,
      "Peminjaman berhasil dibatalkan"
    );
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }

    throw err;
  }
}

module.exports = {
  index,
  show,
  store,
  approve,
  reject,
  borrow,
  returnItem,
  cancel,
};