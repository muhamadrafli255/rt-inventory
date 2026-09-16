const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),

  email: z
    .string()
    .email("Format email tidak valid"),

  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter"),

  phone: z
    .string()
    .max(30)
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .max(255)
    .optional()
    .or(z.literal("")),
});

const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid"),

  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

module.exports = {
  registerSchema,
  loginSchema,
};