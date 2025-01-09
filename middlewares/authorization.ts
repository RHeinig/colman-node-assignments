import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const AUTHORIZATION_HEADER_FIELD = "authorization";
const authorize = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers[AUTHORIZATION_HEADER_FIELD];
  const token = authHeader?.split(" ")?.at(1);
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (error, userInfo) => {
      if (error) {
        return res.status(403).send(error.message);
      }
      req.user = userInfo;
      next();
    }
  );
};

export { authorize };
