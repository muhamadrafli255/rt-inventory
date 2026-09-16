const userService = require("../services/user.service");
const { success, error } = require("../utils/apiResponse");

async function index(req, res) {
  try {
    const result = await userService.getUsers(req.validated.query);
    return success(res, result, "Daftar warga berhasil diambil");
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }
    throw err;
  }
}

async function show(req, res) {
  try {
    const user = await userService.getUserById(req.validated.params.id);
    return success(res, user, "Detail warga berhasil diambil");
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }
    throw err;
  }
}

async function store(req, res) {
  try {
    const user = await userService.createUser(req.validated.body);
    return success(res, user, "Warga berhasil ditambahkan", 201);
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }
    throw err;
  }
}

async function update(req, res) {
  try {
    const user = await userService.updateUser(
      req.validated.params.id,
      req.validated.body
    );
    return success(res, user, "Data warga berhasil diperbarui");
  } catch (err) {
    if (err.statusCode) {
      return error(res, err.message, err.statusCode);
    }
    throw err;
  }
}

async function destroy(req, res) {
  try {
    const result = await userService.deleteUser(req.validated.params.id);
    return success(res, null, result.message);
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
