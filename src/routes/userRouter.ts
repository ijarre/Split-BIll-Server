import { Router } from "express";
import { createUser, getAllUser, getUser } from "../controller";

const router = Router();

router.get("/", getUser);
router.get("/all", getAllUser);
router.post("/create", createUser);

export default router;
