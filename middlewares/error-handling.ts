import { NextFunction, Request, Response } from "express";

const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message = "Server Error";
  let status = 500;
  if (error instanceof Error) {
    message = error.message;
    status = 400;
  }
  console.error(`[Error]: ${message}`);
  res.status(status).send(message);
};

export { errorHandler };
