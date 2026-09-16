const { z } = require("zod");

const loanIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const createLoanSchema = z.object({
  body: z.object({
    itemId: z.coerce.number().int().positive(),

    quantity: z.coerce
      .number()
      .int()
      .positive("Jumlah pinjaman harus lebih dari 0"),

    purpose: z
      .string()
      .trim()
      .min(5, "Tujuan peminjaman minimal 5 karakter")
      .max(1000),

    notes: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional()
      .or(z.literal("")),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),
  }),
});

const loanListSchema = z.object({
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

    status: z
      .enum([
        "MENUNGGU",
        "DISETUJUI",
        "DITOLAK",
        "DIPINJAM",
        "DIKEMBALIKAN",
        "DIBATALKAN",
      ])
      .optional(),
  }),
});

const rejectLoanSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  body: z.object({
    rejectionReason: z
      .string()
      .trim()
      .min(5, "Alasan penolakan minimal 5 karakter")
      .max(1000),
  }),
});

module.exports = {
  loanIdSchema,
  createLoanSchema,
  loanListSchema,
  rejectLoanSchema,
};