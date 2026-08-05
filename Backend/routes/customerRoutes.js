import express from "express";
import { createCustomer, listCustomers } from "../controller/customerController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listCustomers);
router.post("/", createCustomer);

export default router;
