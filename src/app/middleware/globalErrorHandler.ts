import { Request, Response, NextFunction } from "express";
import status from "http-status";
import z from "zod";
import { envVars } from "../config/env";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";

interface TErrorSource {
  path: string;
  message: string;
}

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("global error", err);
  }

  if (req.file) {
    await deleteFileFromCloudinary(req.file?.path);
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = req.files.map((file) => file.path);

    await Promise.all(imageUrls.map((url) => deleteFileFromCloudinary(url)));
  }

  let errorSource: TErrorSource[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";

  if (err instanceof z.ZodError) {
    statusCode = status.BAD_REQUEST;
    message = "Validation error";
    err.issues.forEach((error) => {
      errorSource.push({
        path:
          error.path.length > 1
            ? error.path.join("=>")
            : error.path[0].toString(),
        message: error.message,
      });
    });
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: err.message,
    errorSource,
  });
};
