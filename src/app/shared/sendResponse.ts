import { Response } from "express";

interface IResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  httpStatusCode: number;
}

export const sendResponse = <T>(
  res: Response,
  responseData: IResponseData<T>,
) => {
  const { httpStatusCode, success, data, message } = responseData;

  res.status(httpStatusCode).json({
    success,
    message,
    data,
  });
};
