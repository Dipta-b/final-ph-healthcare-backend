import { Router } from "express";
import { SpecialityRoute } from "../module/speciality/speciality.routes";
import { authRoutes } from "../module/auth/auth.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { UserRoutes } from "../module/user/user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/specialities", SpecialityRoute);
router.use("/users", UserRoutes);
router.use("/doctors", DoctorRoutes);
export const indexRoute = router;
