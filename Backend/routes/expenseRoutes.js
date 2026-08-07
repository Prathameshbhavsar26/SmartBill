import express from "express";

import {
  createExpense,
  listExpenses,
} from "../controller/expenseController.js";

import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listExpenses);
router.post("/", createExpense);

export default router;