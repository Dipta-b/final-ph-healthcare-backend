import { error } from "node:console";
import { IRequestUser } from "../../interfaces/request.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appoinments.interface";
import { v7 as uuidv7 } from "uuid";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";

const bookAppointment = async (payload: IBookAppointmentPayload, user: IRequestUser) => {

    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false,
        }
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where: {
            id: payload.scheduleId,
        }
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleData.id,
            }
        }
    });

    const videoCallingId = String(uuidv7());

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                doctorId: payload.doctorId,
                patientId: patientData.id,
                scheduleId: doctorSchedule.scheduleId,
                videoCallingId,
            }
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                }
            },
            data: {
                isBooked: true,
            }
        });
        const transactionId = String(uuidv7())


        return appointmentData
    })
    return result
}

const getMyAppointments = async (user: IRequestUser) => {
    //user can be patient or doctor, so we need to check both
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointments = [];

    if (patientData) {
        appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        });
    } else if (doctorData) {
        appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                schedule: true
            }
        });
    } else {
        throw new Error("User not found");
    }

    return appointments;

}
const changeAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: IRequestUser) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
            // status: AppointmentStatus.SCHEDULED
        },
        include: {
            doctor: true
        }
    });

    // if (!appointmentData) {
    //     throw new AppError(status.NOT_FOUND, "Appointment not found or already completed/cancelled");
    // }

    if (user?.role === Role.DOCTOR) {
        if (!(user?.email === appointmentData.doctor.email))
            throw error("This is not your appointment")
    }

    return await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status: appointmentStatus
        }
    })

}

// refactoring on include of doctor and patient data in appointment details, we can use query builder to get the data in single query instead of multiple queries in case of doctor and patient both
const getMySingleAppointment = async (appointmentId: string, user: IRequestUser) => {

    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointment;

    if (patientData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        });
    } else if (doctorData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                schedule: true
            }
        });
    }

    if (!appointment) {
        throw error("Appointment not found");
    }

    return appointment;
}

// integrate query builder
const getAllAppointments = async () => {
    const appointments = await prisma.appointment.findMany({
        include: {
            doctor: true,
            patient: true,
            schedule: true
        }
    });
    return appointments;
}


export const AppointmentService = {
    bookAppointment,
} 