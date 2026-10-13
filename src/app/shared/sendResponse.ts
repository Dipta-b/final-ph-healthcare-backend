import { Response } from "express";

interface IResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  httpStatusCode: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = <T>(
  res: Response,
  responseData: IResponseData<T>,
) => {
  const { httpStatusCode, success, data, message, meta } = responseData;

  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta: responseData.meta,
  });
};
