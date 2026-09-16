const categoryService = require("../services/category.service");
const { success, error } = require("../utils/apiResponse");

async function index(req, res) {
  const categories = await categoryService.getAllCategories();

  return success(
    res,
    categories,
    "Daftar kategori berhasil diambil"
  );
}

async function show(req, res) {
  const category = await categoryService.getCategoryById(
    req.validated.params.id
  );

  if (!category) {
    return error(res, "Kategori tidak ditemukan", 404);
  }

  return success(
    res,
    category,
    "Detail kategori berhasil diambil"
  );
}

async function store(req, res) {
  try {
    const category = await categoryService.createCategory(
      req.validated.body
    );

    return success(
      res,
      category,
      "Kategori berhasil dibuat",
      201
    );
  } catch (err) {
    if (err.code === "P2002") {
      return error(
        res,
        "Nama kategori sudah digunakan",
        409
      );
    }

    throw err;
  }
}

async function update(req, res) {
  const id = req.validated.params.id;

  const existingCategory = await categoryService.getCategoryById(id);

  if (!existingCategory) {
    return error(res, "Kategori tidak ditemukan", 404);
  }

  try {
    const category = await categoryService.updateCategory(
      id,
      req.validated.body
    );

    return success(
      res,
      category,
      "Kategori berhasil diperbarui"
    );
  } catch (err) {
    if (err.code === "P2002") {
      return error(
        res,
        "Nama kategori sudah digunakan",
        409
      );
    }

    throw err;
  }
}

async function destroy(req, res) {
  const id = req.validated.params.id;

  const existingCategory = await categoryService.getCategoryById(id);

  if (!existingCategory) {
    return error(res, "Kategori tidak ditemukan", 404);
  }

  if (existingCategory.items.length > 0) {
    return error(
      res,
      "Kategori tidak dapat dihapus karena masih memiliki barang",
      409
    );
  }

  await categoryService.deleteCategory(id);

  return success(
    res,
    null,
    "Kategori berhasil dihapus"
  );
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};