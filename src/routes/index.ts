import { Router } from "express";
import userRoutes from "./userRouter";

const router = Router();

router.use("/user", userRoutes);

export default router;
