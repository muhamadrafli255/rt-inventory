const { z } = require("zod");

const userIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter"),
    email: z.string().trim().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    phone: z.string().trim().nullable().optional().or(z.literal("")),
    address: z.string().trim().nullable().optional().or(z.literal("")),
    roleName: z.enum(["WARGA", "ADMIN"]).default("WARGA"),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").optional(),
    email: z.string().trim().email("Format email tidak valid").optional(),
    password: z.string().min(6, "Password minimal 6 karakter").nullable().optional().or(z.literal("")),
    phone: z.string().trim().nullable().optional().or(z.literal("")),
    address: z.string().trim().nullable().optional().or(z.literal("")),
    roleName: z.enum(["WARGA", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
  }),
});

const userListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    role: z.string().optional(),
    isActive: z
      .string()
      .optional()
      .transform((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      }),
  }),
});

module.exports = {
  userIdSchema,
  createUserSchema,
  updateUserSchema,
  userListSchema,
};
