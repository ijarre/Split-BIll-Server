import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express";
import { generateSlug } from "random-word-slugs";

const prisma = new PrismaClient();
interface Item {
  item_id: number;
  item_name: string;
  item_price: number;
}
export const createTransaction = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const slug = generateSlug();
  if (typeof user_id === "string") res.status(403).json({ error: "wrong input" });
  const transaction = await prisma.transaction.create({
    data: {
      slug,
      User: {
        connect: {
          user_id,
        },
      },
    },
    include: {
      Item: true,
      User: true,
    },
  });
  res.status(200).json(transaction);
};

export const addUserToTransaction = async (req: Request, res: Response) => {
  const { user_id, transaction_id } = req.body;

  const trx = await prisma.transaction.findUnique({
    where: {
      transaction_id,
    },
    include: {
      User: true,
    },
  });
  if (trx) {
    if (trx.User.filter((el) => el.user_id === user_id).length === 0) {
      const addUser = await prisma.transaction.update({
        where: {
          transaction_id,
        },
        data: {
          User: {
            connect: {
              user_id,
            },
          },
        },
        include: {
          User: true,
        },
      });

      res.status(200).json({ data: addUser, message: "success adding member to transaction" });
    } else {
      res.status(403).json({ error: "user is already in transaction" });
    }
  } else {
    res.status(403).json({ error: "cannot find transaction" });
  }
};
export const addItemToTransaction = async (req: Request, res: Response) => {
  const { item_id, transaction_id, item_name, item_price } = req.body;
  if (!transaction_id) {
    res.status(403).json({ error: "transaction id is required" });
    return;
  }
  if (item_name && item_price) {
    const trx = await prisma.transaction.update({
      where: {
        transaction_id,
      },
      data: {
        Item: {
          create: {
            item_name,
            item_price,
          },
        },
      },
      select: {
        Item: {
          select: {
            item_name: true,
            item_price: true,
          },
        },
      },
    });

    res.status(200).json({ message: "success create item to transaction", data: trx });
  } else {
    if (!item_id) {
      res.status(403).json({ error: "item_id or (item_name and item_price) is required" });
      return;
    } else {
      const trx = await prisma.transaction.update({
        where: {
          transaction_id,
        },
        data: {
          Item: {
            connect: {
              item_id,
            },
          },
        },
      });
      res.status(200).json({ message: "success adding item to transaction", data: trx });
    }
  }
};

export const getAllTransaction = async (_: Request, res: Response) => {
  const allTransaction = await prisma.transaction.findMany({
    include: {
      User: true,
      Item: true,
    },
  });
  res.send(allTransaction);
};

export const getUserItemInTransaction = async (req: Request, res: Response) => {
  const { transaction_id, user_id } = req.body;
  const result = await prisma.transaction.findUnique({
    where: {
      transaction_id,
    },
    select: {
      Item: {
        select: {
          UserItem: {
            where: {
              user_id,
            },
          },
        },
      },
    },
  });
  res.status(200).json({ data: result });
};

export const getItemInTransaction = async (req: Request, res: Response) => {
  const { transaction_id } = req.body;

  const transaction = await prisma.transaction.findUnique({
    where: {
      transaction_id,
    },
    select: {
      transaction_id: true,
      slug: true,
      Item: true,
    },
  });
  res.status(200).json({ data: transaction });
};

const itemsInTransactionInfo = async (transaction_id: number) => {
  return await prisma.transaction.findUnique({
    where: {
      transaction_id,
    },
    select: {
      transaction_id: true,
      slug: true,
      Item: {
        select: {
          item_name: true,
          item_price: true,
          item_id: true,
          UserItem: {
            where: {
              OR: [
                {
                  is_paying: {
                    equals: true,
                  },
                },
                {
                  is_sharing: {
                    equals: true,
                  },
                },
              ],
            },
            select: {
              is_paying: true,
              is_sharing: true,
              User: {
                select: {
                  username: true,
                  user_id: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getTransactionInfo = async (req: Request, res: Response) => {
  const { transaction_id } = req.body;

  const trx = await itemsInTransactionInfo(transaction_id);
  let totalTransactionPrice = 0;
  trx?.Item.forEach((el) => {
    totalTransactionPrice += el.item_price;
  });
  const errors: { error: string; item_id: number }[] = [];

  const returnedData = {
    message: "success getting transaction info",
    data: {
      transaction_id: trx?.transaction_id,
      slug: trx?.slug,
      totalPrice: totalTransactionPrice,
      items: trx?.Item.map((el) => {
        const sharingUser = el.UserItem.filter((el) => el.is_sharing === true).map((el) => {
          return el.User;
        });
        const payingUser = el.UserItem.filter((el) => el.is_paying === true).map((el) => {
          return el.User;
        });
        if (sharingUser.length === 0) {
          errors.push({ error: `please assign user sharing this item_id: ${el.item_id}`, item_id: el.item_id });
        }
        if (payingUser.length === 0) {
          errors.push({ error: `please assign user paying this item_id: ${el.item_id}`, item_id: el.item_id });
        }
        return {
          item_id: el.item_id,
          item_price: el.item_price,
          sharingUser,
          sharing_count: sharingUser.length,
          payingUser,
          paying_count: payingUser.length,
        };
      }),
    },
  };
  if (errors.length !== 0) {
    res.status(400).json({ errors });
    return;
  }

  res.status(200).json(returnedData);
};

export const getTransactionSplittedBill = async (req: Request, res: Response) => {
  const { transaction_id } = req.body;

  const userInTransaction = await prisma.transaction.findUnique({
    where: {
      transaction_id,
    },
    select: {
      User: true,
    },
  });

  const itemsInTransaction = await itemsInTransactionInfo(transaction_id);

  const userItemObj: Record<number, { paying: Item[]; sharing: Item[] }> = {};
  itemsInTransaction?.Item.forEach((item) => {
    let totalSharing = 0;
    let totalPaying = 0;
    item.UserItem.forEach((el) => {
      if (el.is_paying) {
        totalPaying++;
      }
      if (el.is_sharing) {
        totalSharing++;
      }
    });

    item.UserItem.forEach((el) => {
      if (!userItemObj[el.User.user_id]) {
        userItemObj[el.User.user_id] = { paying: [], sharing: [] };
      }
      const itemElement = { item_id: item.item_id, item_name: item.item_name, item_price: item.item_price };
      if (el.is_paying) {
        userItemObj[el.User.user_id].paying.push({ ...itemElement, item_price: itemElement.item_price / totalPaying });
      }
      if (el.is_sharing) {
        userItemObj[el.User.user_id].sharing.push({ ...itemElement, item_price: itemElement.item_price / totalSharing });
      }
    });
  });

  const returnedData = userInTransaction?.User.map((user) => {
    return {
      user_id: user.user_id,
      username: user.username,
      balance: user.balance,
      itemInfo: userItemObj[user.user_id],
    };
  });

  res.status(200).json({ data: returnedData });
};
