function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: "Data yang dikirim tidak valid",
        errors: result.error.flatten(),
      });
    }

    req.validated = result.data;

    next();
  };
}

module.exports = validate;