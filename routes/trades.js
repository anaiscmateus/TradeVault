const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const tradesController = require("../controllers/trades");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Trade Routes
// create a position
router.post("/addTrade", upload.single("file"), tradesController.addTrade);

// update position
router.put("/updateTrade/:id", tradesController.updateTrade);

// add to position
router.put("/addToPosition/:id", tradesController.addToPosition);

// sell position
router.put("/sellPosition/:id", tradesController.sellPosition);

// update balance
router.put("/updateBalance/:id", tradesController.updateBalance);

// delete a position
router.delete("/deleteTrade/:id", tradesController.deleteTrade);

module.exports = router;