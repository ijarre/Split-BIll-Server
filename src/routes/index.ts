import { Router } from "express";
import userRoutes from "./userRouter";
import transactionRoutes from "./transactionRouter";
import itemRoutes from "./itemRouter";
import { authenticateToken } from "../middleware";

const router = Router();

router.use("/user", userRoutes);
router.use("/transaction", transactionRoutes);
router.use("/item", authenticateToken, itemRoutes);

export default router;
