function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: "Data tidak valid",
        errors: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;

    next();
  };
}

module.exports = validate;