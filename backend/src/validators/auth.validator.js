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

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),

  phone: z
    .string()
    .trim()
    .max(30)
    .nullable()
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional()
    .or(z.literal("")),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmPassword"],
  });

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};