import { Speciality } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpeciality = async (payload: Speciality): Promise<Speciality> => {
  const speciality = await prisma.speciality.create({
    data: payload,
  });

  return speciality;
};

const getAllSpecialities = async (): Promise<Speciality[]> => {
  const specialities = await prisma.speciality.findMany();
  return specialities;
};

const updateSpeciality = async (
  id: string,
  payload: Speciality,
): Promise<Speciality | null> => {
  const speciality = await prisma.speciality.update({
    where: {
      id,
    },
    data: payload,
  });

  return speciality;
};

const deleteSpeciality = async (id: string): Promise<Speciality | null> => {
  const speciality = await prisma.speciality.delete({
    where: {
      id,
    },
  });

  return speciality;
};

export const specialityService = {
  createSpeciality,
  getAllSpecialities,
  updateSpeciality,
  deleteSpeciality,
};
