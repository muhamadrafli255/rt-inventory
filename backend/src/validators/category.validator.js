const { z } = require("zod");

const categoryIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Nama kategori minimal 2 karakter")
      .max(100, "Nama kategori maksimal 100 karakter"),

    description: z
      .string()
      .trim()
      .max(500, "Deskripsi maksimal 500 karakter")
      .optional()
      .or(z.literal("")),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Nama kategori minimal 2 karakter")
      .max(100, "Nama kategori maksimal 100 karakter"),

    description: z
      .string()
      .trim()
      .max(500, "Deskripsi maksimal 500 karakter")
      .optional()
      .or(z.literal("")),
  }),
});

module.exports = {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
};