import express from "express";

import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controller/customerController.js";

import { protect } from "../middleware/mid.js";

const router = express.Router();

// All customer routes require authentication.
router.use(protect);

router.get("/", getCustomers);
router.get("/:id", getCustomer);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;