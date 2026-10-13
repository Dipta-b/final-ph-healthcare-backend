import { Router } from "express";
import { specialityController } from "./speciality.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { specialityValidation } from "./speciality.validation";

const router = Router();

router.post(
  "/",
  // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(specialityValidation.createSpecialityZodSchema),
  specialityController.createSpeciality,
);

router.get("/", checkAuth(Role.PATIENT), specialityController.getSpecialities);

router.put(
  "/:id",
  multerUpload.single("file"),
  validateRequest(specialityValidation.updateSpecialityZodSchema),
  specialityController.updateSpeciality,
);

router.delete("/:id", specialityController.deleteSpeciality);

export const SpecialityRoute = router;
