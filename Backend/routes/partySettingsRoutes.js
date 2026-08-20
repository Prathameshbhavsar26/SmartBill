import express from "express";
import { protect } from "../middleware/mid.js";

import {
  getPartySettings,
  updatePartySettings,
} from "../controller/partySettingsController.js";

const router = express.Router();

// All party settings routes require authentication
router.use(protect);

// GET /api/settings/party
router.get("/", getPartySettings);

// PUT /api/settings/party
router.put("/", updatePartySettings);

export default router;
