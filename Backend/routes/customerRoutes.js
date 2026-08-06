import express from "express";
<<<<<<< HEAD
import { createCustomer, listCustomers } from "../controller/customerController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listCustomers);
router.post("/", createCustomer);
=======
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
>>>>>>> 767a4931 (Add customer and order management)

export default router;
