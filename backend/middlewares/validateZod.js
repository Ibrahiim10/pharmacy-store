export const validateZod = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const formatted = result.error.format()

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.keys(formatted)
        .filter((key) => key !== "_errors")
        .map((field) => ({
          field,
          message: formatted[field]?._errors?.[0] || "Invalid input",
        })),
    })
  }

  // ✅ Replace body with validated data (important!)
  req.body = result.data

  next()
}
