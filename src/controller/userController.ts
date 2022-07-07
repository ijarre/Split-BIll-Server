import { Request, Response } from "express";

export const getUser = (req: Request, res: Response) => {
  const { id } = req.body;

  return res.status(200).json({ id });
};
