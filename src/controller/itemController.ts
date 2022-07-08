import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAllItem = async (_: Request, res: Response) => {
  const items = await prisma.item.findMany({
    select: {
      item_name: true,
      item_price: true,

      UserItem: {
        select: {
          User: {
            select: {
              username: true,
              user_id: true,
            },
          },
          is_paying: true,
          is_sharing: true,
        },
      },
    },
  });
  res.status(200).json({ data: items });
};

export const createItem = async (req: Request, res: Response) => {
  const { transaction_id, item_name, item_price } = req.body;

  const item = await prisma.item.create({
    data: {
      item_name,
      item_price,
      Transaction: {
        connect: {
          transaction_id,
        },
      },
    },
  });

  res.status(200).json({ message: "success creating item", data: item });
};

export const assignUserToItem = async (req: Request, res: Response) => {
  const { user_id, item_id, is_paying, is_sharing } = req.body;
  //validate user must be in item's transaction
  const itemTrx = await prisma.item.findUnique({
    where: {
      item_id,
    },
    select: {
      Transaction: {
        select: {
          User: {
            select: {
              user_id: true,
            },
          },
        },
      },
    },
  });
  if (!itemTrx) {
    res.status(400).json({ error: "item not found" });
    return;
  }
  let isInTrx = false;
  itemTrx.Transaction.User.forEach((user) => {
    if (user.user_id === user_id) {
      isInTrx = true;
    }
  });
  if (!isInTrx) {
    res.status(400).json({ error: "user is not in item's transaction" });
    return;
  }

  const userItem = await prisma.userItem.create({
    data: {
      item_id,
      user_id,
      is_paying: is_paying ? is_paying : false,
      is_sharing: is_sharing ? is_sharing : false,
    },
  });
  res.status(200).json({ message: "success assigning user", data: userItem });
};

export const editUserItemInfo = async (req: Request, res: Response) => {
  const { user_id, item_id, is_paying, is_sharing } = req.body;

  const userItem = await prisma.userItem.update({
    where: {
      item_id_user_id: {
        item_id,
        user_id,
      },
    },
    data: {
      is_paying,
      is_sharing,
    },
  });

  res.status(200).json({ data: userItem });
};
