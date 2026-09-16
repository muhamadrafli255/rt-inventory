const { z, nullable } = require("zod");

const itemIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const createItemSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Nama barang minimal 2 karakter")
      .max(150),

    code: z
      .string()
      .trim()
      .min(2, "Kode barang minimal 2 karakter")
      .max(50)
      .transform((value) => value.toUpperCase()),

    categoryId: z.coerce.number().int().positive(),

    description: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional()
      .or(z.literal("")),

    quantity: z.coerce
      .number()
      .int()
      .min(0, "Jumlah tidak boleh negatif"),

    condition: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .default("BAIK"),

    imageUrl: z
    .string()
    .url("URL gambar tidak valid")
    .nullable()
    .optional()
    .or(z.literal("")),
  }),
});

const updateItemSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    code: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .optional()
      .transform((value) => value.toUpperCase()),

    categoryId: z.coerce.number().int().positive().optional(),

    description: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional()
      .or(z.literal("")),

    quantity: z.coerce
      .number()
      .int()
      .min(0)
      .optional(),

    available: z.coerce
      .number()
      .int()
      .min(0)
      .optional(),

    condition: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .optional(),

    imageUrl: z
    .string()
    .url("URL gambar tidak valid")
    .nullable()
    .optional()
    .or(z.literal("")),
  }),
});

const itemListSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(10),

    search: z
      .string()
      .trim()
      .optional()
      .default(""),

    categoryId: z
      .coerce
      .number()
      .int()
      .positive()
      .optional(),

    condition: z
      .string()
      .trim()
      .optional(),
  }),
});

module.exports = {
  itemIdSchema,
  createItemSchema,
  updateItemSchema,
  itemListSchema,
};