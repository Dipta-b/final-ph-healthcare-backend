import { z } from "zod";

const createSpecialityZodSchema = z.object({
  title: z.string({ message: "Title is required" }),
  description: z.string().optional(),
});

const updateSpecialityZodSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

export const specialityValidation = {
  createSpecialityZodSchema,
  updateSpecialityZodSchema,
};
