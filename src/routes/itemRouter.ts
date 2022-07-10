import { Router } from "express";
import { assignUserToItem, createItem, editUserItemInfo, getAllItem } from "../controller";

const router = Router();

router.post("/create", createItem);
router.post("/assignUser", assignUserToItem);
router.get("/all", getAllItem);
router.post("/editUserItemInfo", editUserItemInfo);

export default router;
