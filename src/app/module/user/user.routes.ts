import { Router, Request, Response } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorSchema } from "./userValidation";

const router = Router();

router.post(
  "/create-doctor",
  // validateRequest(createDoctorSchema),
  UserController.createDoctor,
);

// router.post("/create-admin", UserController.createDoctor);
// router.post("/create-superadmin", UserController.createDoctor);

export const UserRoutes = router;
