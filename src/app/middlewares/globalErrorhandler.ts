/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from 'express';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  type TErrorSources = {
    path: string | number;
    message: string;
  }[];

  const errorSources: TErrorSources = [
    {
      path: '',
      message: '',
    },
  ];

  return res.status(statusCode).json({
    success: false,
    message,
    // error: err,
    errorSources,
  });
};

export default globalErrorHandler;
