const itemService = require("../services/item.service");
const { success, error } = require("../utils/apiResponse");

async function index(req, res) {
  const result = await itemService.getAllItems(req.validated.query);

  return success(
    res,
    result,
    "Daftar barang berhasil diambil"
  );
}

async function show(req, res) {
  const item = await itemService.getItemById(
    req.validated.params.id
  );

  if (!item) {
    return error(res, "Barang tidak ditemukan", 404);
  }

  return success(
    res,
    item,
    "Detail barang berhasil diambil"
  );
}

async function store(req, res) {
  try {
    const item = await itemService.createItem(
      req.validated.body
    );

    return success(
      res,
      item,
      "Barang berhasil dibuat",
      201
    );
  } catch (err) {
    if (err.code === "P2002") {
      return error(
        res,
        "Kode barang sudah digunakan",
        409
      );
    }

    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }

    throw err;
  }
}

async function update(req, res) {
  try {
    const item = await itemService.updateItem(
      req.validated.params.id,
      req.validated.body
    );

    return success(
      res,
      item,
      "Barang berhasil diperbarui"
    );
  } catch (err) {
    if (err.code === "P2002") {
      return error(
        res,
        "Kode barang sudah digunakan",
        409
      );
    }

    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }

    throw err;
  }
}

async function destroy(req, res) {
  try {
    await itemService.softDeleteItem(
      req.validated.params.id
    );

    return success(
      res,
      null,
      "Barang berhasil dihapus"
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
  update,
  destroy,
};