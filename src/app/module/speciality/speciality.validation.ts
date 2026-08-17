const { z } = require("zod");

const createSpecialityZodSchema = z.object({
  title: z.string({ "Title is required": "Title is required" }),
  description: z.string("Description is optional").optional(),
});

export const specialityValidation = {
  createSpecialityZodSchema,
};
