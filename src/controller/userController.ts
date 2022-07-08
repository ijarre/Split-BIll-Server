import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      user_id: req.body.user_id,
    },
    include: {
      UserItem: {
        select: {
          Item: true,
          is_paying: true,
          is_sharing: true,
        },
      },
    },
  });
  res.status(200).json(user);
};

export const getAllUser = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      UserItem: true,
    },
  });

  res.status(200).json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const newUser = await prisma.user.create({
    data: {
      username: req.body.username,
    },
  });
  res.status(200).json(newUser);
};
