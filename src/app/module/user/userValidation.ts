import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorSchema = z.object({
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters long"),

  doctor: z.object({
    name: z
      .string("Name is required")
      .min(5, "Name must be atleast 5 characters long")
      .max(40, "Name must be less than 40  characters long"),

    email: z.email("Invalid email address"),
    contactNumber: z
      .string("Contact number is required")
      .regex(/^[0-9]{11}$/, "Invalid contact number"),
    address: z.string("Address required").optional(),
    registrationNumerber: z.string("Registration number is required"),
    experience: z
      .number("Experience is required")
      .nonnegative("Experience must be a non-negative number"),
    gender: z.enum(
      [Gender.Male, Gender.Female],
      "Gender must be Male or Female",
    ),
    appointmentFee: z
      .number("Appointment fee is required")
      .nonnegative("Appointment fee must be a non-negative number"),
    qualification: z
      .string("Qualification is required")
      .min(5, "Qualification must be at least 5 characters long")
      .max(100, "Qualification must be less than 100 characters long"),
    currentWorkingPlace: z.string("Current working place is required"),
    designation: z
      .string("Designation is required")
      .min(2, "Designation must be at least 2 characters long")
      .max(50, "Designation must be less than 50 characters long"),
  }),
  specialities: z
    .array(z.uuid("Invalid speciality ID"))
    .min(1, "At least one speciality is required"),
});
