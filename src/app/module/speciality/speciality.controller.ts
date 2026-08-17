import { NextFunction, Request, RequestHandler, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { specialityService } from "./speciality.service";

const createSpeciality = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await specialityService.createSpeciality(payload);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Speciality created successfully",
    data: result,
  });
});

const getSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await specialityService.getAllSpecialities();

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Speciality get successfully",
    data: result,
  });
});

const updateSpeciality = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await specialityService.updateSpeciality(
    id as string,
    payload,
  );

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Speciality updated successfully",
    data: result,
  });
});

const deleteSpeciality = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await specialityService.deleteSpeciality(id as string);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Speciality deleted successfully",
    data: result,
  });
});

export const specialityController = {
  createSpeciality,
  getSpecialities,
  updateSpeciality,
  deleteSpeciality,
};
