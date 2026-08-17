import { NextFunction, Router, Request, Response } from "express";
import { specialityController } from "./speciality.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post("/", specialityController.createSpeciality);
router.get("/", checkAuth(Role.PATIENT), specialityController.getSpecialities);
router.put("/:id", specialityController.updateSpeciality);
router.delete("/:id", specialityController.deleteSpeciality);

export const SpecialityRoute = router;
