import express from "express";
import { upload } from "../middleware/multer.js";
import {
  createTrade,
  fetchAllTrades,
  addTradePosition,
  sellTradePosition,
  deleteTrade,
  openaiFeedback,
  fetchNews
} from "../controllers/trades.js";

const router = express.Router();

// CREATE
router.post("/trades", upload.single("file"), createTrade);
router.post("/trades/feedback", openaiFeedback);

// READ
router.get("/trades", fetchAllTrades);
router.get("/:symbol/news", fetchNews);

// UPDATE
router.put("/trades/:id/position/add", addTradePosition);

// UPDATE
router.put("/trades/:id/position/sell", sellTradePosition);

// DELETE
router.delete("/trades/:id", deleteTrade);

export { router };
