const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  // new trade added
  // i was in the options market
  market: {
    type: String,
  },
  // yesterday
  initialPurchaseDate: {
    type: Date,
  },
  // i looked at spy
  symbol: {
    type: String,
  },
  // saw it was going to break to the downside
  direction: {
    type: String,
  },
  // i took a picture of my setup
  image: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
  // i took notes of the setup + my emotions
  notes: {
    type: String,
  },
  // i opened my trade
  open: {
    type: Boolean,
  },
  // this many of x
  quantity: {
    type: Number,
  },
  // at this price
  initialPurchasePrice: {
    type: Number,
  },
  // i added my new trade to the transactions list/bought and sold over a period of time
  transactions: [
    {
      // i bought/sold
      action: {
        type: String,
      },
      // x amount
      quantity: {
        type: Number,
      },
      // at x price
      price: {
        type: Number,
      },
      // for a total of x
      total: {
        type: Number,
      },
      // yesterday
      date: {
        type: Date,
      },
      // here is my stop loss
      stopLoss: {
        type: Number,
      },
    }
  ],
  // this is my position, this will fluctuate based on whether I buy or sell for this trade
  position: {
    type: Number,
  },
  // eventually i closed my position at the end of the day
  finalPurchaseDate: {
    type: Date,
    default: null,
  },
  // at this price
  finalPurchasePrice: {
    type: Number,
    default: null,
  },
  // this was my return
  returnAmount: {
    type: Number,
    default: null,
  },
  // this was my exit total
  exitTotal: {
    type: Number,
    default: null,
  },
  // me
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // when I created this log in TradeVault db
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Trade", tradeSchema);