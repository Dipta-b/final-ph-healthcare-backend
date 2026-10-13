import { Router } from "express";
import { SpecialityRoute } from "../module/speciality/speciality.routes";
import { authRoutes } from "../module/auth/auth.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { UserRoutes } from "../module/user/user.routes";
import { scheduleRoutes } from "../module/schedule/schedule.route";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.route";
import { AppointmentRoutes } from "../module/appoinments/appoinments.route";
import { StatsRoutes } from "../module/stats/stats.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/specialities", SpecialityRoute);
router.use("/users", UserRoutes);
router.use("/doctors", DoctorRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/doctor-schedules", DoctorScheduleRoutes)
router.use("/appointments", AppointmentRoutes)
router.use("/stats", StatsRoutes)

export const indexRoute = router;
