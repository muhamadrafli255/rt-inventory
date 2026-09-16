const dashboardService = require("../services/dashboard.service");
const { success } = require("../utils/apiResponse");

async function index(req, res) {
  const dashboard = await dashboardService.getDashboard();

  return success(
    res,
    dashboard,
    "Dashboard berhasil diambil"
  );
}

async function summary(req, res) {
  const data = await dashboardService.getDashboardSummary();

  return success(
    res,
    data,
    "Ringkasan dashboard berhasil diambil"
  );
}

async function loanStatistics(req, res) {
  const data = await dashboardService.getLoanStatistics();

  return success(
    res,
    data,
    "Statistik peminjaman berhasil diambil"
  );
}

async function popularItems(req, res) {
  const data = await dashboardService.getPopularItems();

  return success(
    res,
    data,
    "Barang populer berhasil diambil"
  );
}

async function recentLoans(req, res) {
  const data = await dashboardService.getRecentLoans();

  return success(
    res,
    data,
    "Aktivitas terbaru berhasil diambil"
  );
}

module.exports = {
  index,
  summary,
  loanStatistics,
  popularItems,
  recentLoans,
};