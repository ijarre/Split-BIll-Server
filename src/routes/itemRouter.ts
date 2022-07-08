import { Router } from "express";
import { assignUserToItem, createItem, getAllItem } from "../controller";

const router = Router();

router.post("/create", createItem);
router.post("/assignUser", assignUserToItem);
router.get("/all", getAllItem);

export default router;
