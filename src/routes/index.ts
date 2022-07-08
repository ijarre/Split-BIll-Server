import { Router } from "express";
import userRoutes from "./userRouter";
import transactionRoutes from "./transactionRouter";
import itemRoutes from "./itemRouter";

const router = Router();

router.use("/user", userRoutes);
router.use("/transaction", transactionRoutes);
router.use("/item", itemRoutes);

export default router;
