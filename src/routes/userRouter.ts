import { Router } from "express";
import { getUser } from "../controller";

const router = Router();

console.log("a");
router.get("/", getUser);

export default router;
