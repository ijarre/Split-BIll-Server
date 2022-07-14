import { Router } from "express";
import { createUser, getAllUser, getUser, login } from "../controller";

const router = Router();

router.get("/", getUser);
router.get("/all", getAllUser);
router.post("/create", createUser);
router.post("/login", login);

export default router;
