import { de } from "zod/v4/locales";
import { prisma } from "../../lib/prisma";
import status from "http-status";
import { STATUS_CODES } from "http";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Doctor, Prisma } from "../../../generated/prisma/client";
import {
  doctorFilterableFields,
  doctorIncludeConfig,
  doctorSearchableFields,
} from "./doctor.constant";

const getAllDoctors = async (query: IQueryParams) => {
  // const doctors = await prisma.doctor.findMany({
  //     where: {
  //         isDeleted: false,
  //     },
  //     include: {
  //         user: true,
  //         specialties: {
  //             include: {
  //                 specialty: true
  //             }
  //         }
  //     }
  // })

  // // const query = new QueryBuilder().paginate().search().filter();
  // return doctors;

  const queryBuilder = new QueryBuilder<
    Doctor,
    Prisma.DoctorWhereInput,
    Prisma.DoctorInclude
  >(prisma.doctor, query, {
    searchableFields: doctorSearchableFields,
    filterableFields: doctorFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    //where er bhitor full doctor ta ache
    .where({
      isDeleted: false,
    })
    .include({
      user: true,
      // specialties: true,
      specialities: {
        include: {
          speciality: true,
        },
      },
    })
    .dynamicInclude(doctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  console.log(result);
  return result;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      specialities: {
        include: {
          speciality: true,
        },
      },
      appointments: {
        include: {
          patient: true,
          schedule: true,
          prescription: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });
  return doctor;
};

/**
 * START
  |
  ↓
Receive doctor id + update payload
  |
  ↓
Find doctor by id
  |
  ↓
Doctor exists?
  |
  +----NO----> Error
  |
 YES
  |
  ↓
Separate doctor data and speciality data
  |
  ↓
Start transaction
  |
  ↓
Update doctor fields
  |
  ↓
Loop speciality changes
  |
  ↓
For every speciality:
  |
  ↓
Check shouldDelete
  |
  +----------------+
  |                |
 YES              NO
  |                |
DELETE           UPSERT
  |                |
Remove           Create if missing
connection       Ignore if exists
  |
  ↓
Commit transaction
  |
  ↓
Fetch updated doctor
  |
  ↓
Return updated doctor
  |
 END
 
 */

const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
  const isDoctorExist = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });

  if (!isDoctorExist) {
    throw new Error("Doctor not found");
  }

  const { doctor: doctorData, specialties } = payload;

  await prisma.$transaction(async (tx) => {
    if (doctorData) {
      await tx.doctor.update({
        where: {
          id,
        },
        data: {
          ...doctorData,
        },
      });
    }

    /**
 * Receive speciality changes

For every speciality:

    If shouldDelete is true:
          Remove doctor-speciality connection

    Otherwise:
          If connection exists:
                do nothing

          If connection doesn't exist:
                create connection

After all changes:
    Fetch updated doctor
    Return doctor
 * 
 */

    if (specialties && specialties.length > 0) {
      for (const specialityItem of specialties) {
        const { specialtyId, shouldDelete } = specialityItem as any;
        if (shouldDelete) {
          await tx.doctorSpeciality.delete({
            where: {
              doctorId_specialityId: {
                doctorId: id,
                specialityId: specialtyId,
              },
            },
          });
        } else {
          await tx.doctorSpeciality.upsert({
            where: {
              doctorId_specialityId: {
                doctorId: id,
                specialityId: specialtyId,
              },
            },
            create: {
              doctorId: id,
              specialityId: specialtyId,
            },
            update: {},
          });
        }
      }
    }
  });

  const doctor = await getDoctorById(id);

  return doctor;
};

//soft delete
const deleteDoctor = async (id: string) => {
  const isDoctorExist = await prisma.doctor.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!isDoctorExist) {
    throw new Error("Doctor not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isDoctorExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED, // Optional: you may also want to block the user
      },
    });

    await tx.session.deleteMany({
      where: { userId: isDoctorExist.userId },
    });

    await tx.doctorSpeciality.deleteMany({
      where: { doctorId: id },
    });
  });

  return { message: "Doctor deleted successfully" };
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
