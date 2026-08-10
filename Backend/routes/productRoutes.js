
import express from "express";
import { protect } from "../middleware/mid.js";

import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

const router = express.Router();

router.post("/", protect, addProduct);

router.get("/", protect, getProducts);

router.put("/:id", protect, updateProduct);

router.delete("/:id", protect, deleteProduct);

export default router;
