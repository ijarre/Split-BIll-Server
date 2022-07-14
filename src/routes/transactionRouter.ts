import { Router } from "express";
import { addItemToTransaction, addUserToTransaction, createTransaction, getAllTransaction, getItemInTransaction, getTransactionInfo, getTransactionSplittedBill, getUserItemInTransaction } from "../controller";

const router = Router();

router.post("/create", createTransaction);
router.get("/all", getAllTransaction);

router.post("/addMember", addUserToTransaction);
router.post("/addItem", addItemToTransaction);
router.get("/getUserItemInTransaction", getUserItemInTransaction);
router.get("/getItemsInTransaction", getItemInTransaction);
router.get("/getTransactionInfo", getTransactionInfo);
router.get("/getTransactionSplittedBill", getTransactionSplittedBill);
export default router;
