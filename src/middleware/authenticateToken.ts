import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.SECRET_KEY as string, (err, decoded) => {
    if (err) return res.sendStatus(403);
    if (typeof decoded !== "string" && decoded) {
      req.user = {
        user_id: decoded["user_id"],
        username: decoded["username"],
        email: decoded["email"],
      };
    }
    return next();
  });
  return res.sendStatus(500);
};
