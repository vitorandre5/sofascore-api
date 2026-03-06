import { Response } from "express";

type SuccessPayload<T> = {
  success: true;
  data: T;
  message: string;
  error: null;
};

type ErrorPayload = {
  success: false;
  data: null;
  message: string;
  error: string;
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "",
  statusCode = 200
): Response<SuccessPayload<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
  });
};

export const sendError = (
  res: Response,
  message: string,
  error: string,
  statusCode = 500
): Response<ErrorPayload> => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error,
  });
};
