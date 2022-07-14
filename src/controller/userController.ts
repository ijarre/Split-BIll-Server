import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";

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
  const { email, password, username, balance } = req.body;
  const requestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(3, "password must be longer than 3 characters"),
    username: z.string().max(20),
    balance: z.optional(z.number().nonnegative("balance cannot have negative value")),
  });

  try {
    await requestSchema.parseAsync({ email, password, username, balance });
  } catch (err) {
    res.status(400).json({ error: "type error", message: err.issues });
    return;
  }

  const checkEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (checkEmail) {
    res.status(400).json({ error: "email is already taken" });
    return;
  }

  const checkUsername = await prisma.user.findUnique({ where: { username } });
  if (!checkUsername) {
    res.status(400).json({ error: "username is already taken" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      balance,
    },
  });

  res.status(200).json({ data: newUser });
};

export const login = async (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;

  const requestSchema = z.object({
    usernameOrEmail: z.string(),
    password: z.string().min(3),
  });

  try {
    await requestSchema.parseAsync({ usernameOrEmail, password });
  } catch (err) {
    res.status(400).json({ error: err });
    return;
  }

  const emailSchema = z.string().email();
  if (emailSchema.safeParse(usernameOrEmail).success) {
    //email
    const user = await prisma.user.findUnique({ where: { email: usernameOrEmail } });
    if (!user) {
      res.status(404).json({ error: "cannot find email in database" });
      return;
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      res.status(400).json({ error: "wrong password" });
      return;
    } else {
      res.status(200).json({ message: "log in success" });
      return;
    }
  }
  const user = await prisma.user.findUnique({ where: { username: usernameOrEmail } });
  if (!user) {
    res.status(404).json({ error: "cannot find username in database" });
    return;
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    res.status(400).json({ error: "wrong password" });
    return;
  } else {
    const secret = process.env.SECRET_KEY;
    const token = jwt.sign({ user_id: user.user_id, username: user.username, email: user.email }, secret as string);
    res.cookie("token", token, { maxAge: 60 * 60 * 24 * 12 });
    res.status(200).json({ message: "log in success" });
    return;
  }
};
