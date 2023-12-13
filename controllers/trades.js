const { request } = require("express");
const cloudinary = require("../middleware/cloudinary");
const Trade = require("../models/Trade");
const User = require("../models/User");
const OpenAI = require("openai");
const fetch = require("node-fetch");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const trades = await Trade.find({ user: req.user.id }).sort({
        initialPurchaseDate: -1,
      });
      const currentDate = new Date();

      res.render("dashboard.ejs", {
        trades: trades,
        user: req.user,
        currentDate,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getNewsPage: async (req, res) => {
    try {
      const trades = await Trade.find({ user: req.user.id }).sort({
        initialPurchaseDate: -1,
      });
      const currentDate = new Date();

      res.render("news.ejs", { trades: trades, user: req.user, currentDate });
    } catch (err) {
      console.log(err);
    }
  },
  getAIPage: async (req, res) => {
    try {
      // grab trades
      const trades = await Trade.find({ user: req.user.id }).sort({
        finalPurchaseDate: -1,
      });

      const currentDate = new Date();

      res.render("ai.ejs", { trades: trades, user: req.user, currentDate });
    } catch (err) {
      console.log(err);
    }
  },
  addTrade: async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      const userInstance = await User.findOne({ _id: req.user.id });
      // note : 'BUY' is the default action when adding a new trade
      const tradeData = {
        // i was in the options market
        market: req.body.market,
        // yesterday
        initialPurchaseDate: req.body.initialPurchaseDate,
        // i was looking at x
        symbol: req.body.symbol,
        // saw it break to the upside
        direction: req.body.direction,
        // took a picture of my setup
        image: result.secure_url,
        cloudinaryId: result.public_id,
        // took notes of my setup + emotions
        notes: req.body.notes,
        // i opened my trade
        open: true,
        // this many of x
        quantity: req.body.initialPurchaseQuantity,
        // at this price
        initialPurchasePrice: req.body.initialPurchasePrice,
        // added my trade to the transactions list
        transactions: [
          {
            action: "BUY",
            quantity: req.body.initialPurchaseQuantity,
            price: req.body.initialPurchasePrice,
            total:
              req.body.initialPurchasePrice * req.body.initialPurchaseQuantity,
            date: req.body.initialPurchaseDate,
            stopLoss: req.body.stopLoss,
          },
        ],
        position:
          req.body.initialPurchasePrice * req.body.initialPurchaseQuantity,
        user: req.user.id,
      };

      // take total from transaction and subtract from user balance
      userInstance.accountBalance =
        userInstance.accountBalance -
        req.body.initialPurchasePrice * req.body.initialPurchaseQuantity;

      await userInstance.save();
      await Trade.create(tradeData);
      console.log("Trade has been added!");
      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
  updateTrade: async (req, res) => {
    try {
      const tradeInstance = await Trade.findOne({
        _id: req.params.id,
        user: req.user.id,
      });
      const userInstance = await User.findOne({ _id: req.user.id });

      if (!tradeInstance) {
        return res.status(404).json({ error: "Trade not found" });
      }

      const prevTotal =
        tradeInstance.transactions[tradeInstance.transactions.length - 1].total;

      const updatedPositionSize =
        req.body.updatedQuantity * req.body.updatedPurchasePrice;

      // Update the first transaction in the transactions array
      if (tradeInstance.transactions.length > 0) {
        tradeInstance.transactions[0].action = req.body.updatedAction;
        tradeInstance.transactions[0].quantity = req.body.updatedQuantity;
        tradeInstance.transactions[0].price = req.body.updatedPurchasePrice;
        tradeInstance.transactions[0].total =
          req.body.updatedQuantity * req.body.updatedPurchasePrice;
        tradeInstance.transactions[0].stopLoss = req.body.updatedStopLoss;
      }

      // Update the rest of the trade fields
      tradeInstance.initialPurchaseDate = req.body.updatedPurchaseDate;
      tradeInstance.symbol = req.body.updatedSymbol;
      tradeInstance.entryPrice = req.body.updatedPurchasePrice;
      tradeInstance.stopLoss = req.body.updatedStopLoss;
      tradeInstance.quantity = req.body.updatedQuantity;
      tradeInstance.notes = req.body.updatedNotes;
      tradeInstance.initialPurchasePrice = req.body.updatedPurchasePrice;
      tradeInstance.position = updatedPositionSize;
      tradeInstance.user = req.user.id;

      if (req.body.updatedMarket) {
        tradeInstance.market = req.body.updatedMarket;
      }

      if (req.body.updatedDirection) {
        tradeInstance.direction = req.body.updatedDirection;
      }

      const diff = prevTotal - updatedPositionSize;
      userInstance.accountBalance += diff;

      // Save the updated trade document
      await userInstance.save();
      await tradeInstance.save();

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  updateBalance: async (req, res) => {
    try {
      await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          accountBalance: req.body.balance * 1,
        }
      );
      console.log("Balance Updated");
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
    }
  },
  addToPosition: async (req, res) => {
    try {
      let tradeInstance = await Trade.findOne({
        _id: req.params.id,
        user: req.user.id,
      });
      const userInstance = await User.findOne({ _id: req.user.id });

      if (!tradeInstance) {
        return res.status(404).json({ error: "Trade not found" });
      }

      const addedQuantity = req.body.addedQuantity * 1;
      const positionSizeChange = addedQuantity * req.body.addedPurchasePrice;

      // Create a new transaction object
      const newTransaction = {
        action: "BUY",
        quantity: addedQuantity,
        price: req.body.addedPurchasePrice,
        total: addedQuantity * req.body.addedPurchasePrice,
        date: req.body.addedPurchasedDate,
        stopLoss: req.body.addedStopLoss,
      };

      // Push the new transaction object into the transactions array
      tradeInstance.transactions.push(newTransaction);

      // Update other fields in the Trade
      tradeInstance.quantity += addedQuantity;
      tradeInstance.position += positionSizeChange;
      tradeInstance.stopLoss = req.body.addedStopLoss;
      tradeInstance.notes = req.body.addedNotes;
      tradeInstance.user = req.user.id;

      userInstance.accountBalance =
        userInstance.accountBalance -
        req.body.addedPurchasePrice * addedQuantity;

      // Save the updated Trade
      await tradeInstance.save();
      await userInstance.save();

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  sellPosition: async (req, res) => {
    try {
      const tradeInstance = await Trade.findOne({
        _id: req.params.id,
        user: req.user.id,
      });
      const userInstance = await User.findOne({ _id: req.user.id });

      if (!tradeInstance) {
        return res.status(404).json({ error: "Trade not found" });
      }

      const soldQuantity = req.body.sellQuantity * 1;
      const salePrice = req.body.sellPrice;
      const soldSharesValue = soldQuantity * salePrice;

      // Create a new transaction object
      const newTransaction = {
        action: "SELL",
        quantity: soldQuantity,
        price: salePrice,
        total: soldSharesValue,
        date: req.body.sellDate,
        stopLoss: req.body.sellStopLoss,
      };

      // Push the new transaction object into the transactions array
      tradeInstance.transactions.push(newTransaction);

      // Update other fields in the Trade
      tradeInstance.quantity -= soldQuantity;

      // Calculate the remaining position after the sale
      const remainingPosition =
        tradeInstance.quantity * tradeInstance.transactions[0].price; // Assuming transactions[0] is the initial purchase

      // Update remaining position
      tradeInstance.position = remainingPosition;

      tradeInstance.stopLoss = req.body.sellStopLoss;
      tradeInstance.notes = req.body.sellNotes;
      tradeInstance.user = req.user.id;

      if (tradeInstance.quantity <= 0) {
        tradeInstance.open = false;
        const totalBuyValue = tradeInstance.transactions
          .filter((transaction) => transaction.action === "BUY")
          .reduce((sum, transaction) => sum + transaction.total, 0);

        const totalSellValue = tradeInstance.transactions
          .filter((transaction) => transaction.action === "SELL")
          .reduce((sum, transaction) => sum + transaction.total, 0);

        // Calculate the total quantity bought
        const totalQuantityBought = tradeInstance.transactions
          .filter((transaction) => transaction.action === "BUY")
          .reduce((sum, transaction) => sum + transaction.quantity, 0);

        const totalQuantitySold = tradeInstance.transactions
          .filter((transaction) => transaction.action === "SELL")
          .reduce((sum, transaction) => sum + transaction.quantity, 0);

        // Calculate the weighted average purchase price
        const weightedAveragePurchasePrice =
          totalQuantityBought > 0
            ? totalBuyValue / totalQuantityBought
            : tradeInstance.transactions[0].price; // Default to the price of the first transaction if no purchases were made

        // Calculate the remaining position using the weighted average purchase price
        const remainingPosition =
          tradeInstance.quantity * weightedAveragePurchasePrice;

        // Calculate the return amount based on total sales revenue and total purchase cost
        tradeInstance.returnAmount = totalSellValue - totalBuyValue;

        // Calculate exit total based on total sales revenue
        tradeInstance.exitTotal = totalSellValue;

        // add the final purchase price
        tradeInstance.finalPurchasePrice = salePrice;

        // set return amount explicitly to 0 if selling all shares at the same price bought
        if (totalBuyValue === totalSellValue) {
          tradeInstance.returnAmount = 0;
        }

        // get the finals purchase date
        tradeInstance.finalPurchaseDate = req.body.sellDate;
      }

      userInstance.accountBalance =
        userInstance.accountBalance + salePrice * soldQuantity;

      // Save the updated Trade
      await tradeInstance.save();
      await userInstance.save();

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  deleteTrade: async (req, res) => {
    try {
      let tradeInstance = await Trade.findById({ _id: req.params.id });
      await cloudinary.uploader.destroy(tradeInstance.cloudinaryId);
      await tradeInstance.remove({ _id: req.params.id });
      console.log("Deleted Trade");
      res.redirect("/dashboard");
    } catch (err) {
      res.redirect("/dashboard");
    }
  },
  fetchData: async (req, res) => {
    try {
      const trades = await Trade.find({ user: req.user.id }).sort({
        initialPurchaseDate: 1,
      });
      res.json(trades);
    } catch (err) {
      console.log(err);
    }
  },
  openAI: async (req, res) => {
    try {
      const trades = await Trade.find({ user: req.user.id }).sort({
        initialPurchaseDate: 1,
      });
      // grab the last 5 trades
      const tradeSummary = trades
        .slice(0, 5)
        .map((trade) => {
          // Calculate the total quantity bought
          const totalQuantityBought = trade.transactions
            .filter((transaction) => transaction.action === "BUY")
            .reduce((sum, transaction) => sum + transaction.quantity, 0);

          if (trade.returnAmount) {
            return `$${trade.symbol}, ${
              trade.direction
            }side, ${totalQuantityBought} shares, Entry $${
              trade.transactions[0].price
            }, Stop Loss $${trade.transactions[0].stopLoss}, Exit $${
              trade.transactions[trade.transactions.length - 1].price
            }, Return $${trade.returnAmount}, Notes ${trade.notes}`;
          }
        })
        .join("\n");

      const prompt = `I recently executed the following trades:\n${tradeSummary}\nAnalyze these trades and provide brief insights in 3 to 4 concise bullet points, each are STRICTLY limited to 100-125 characters. The bullet points will always be "*". Focus on key aspects like risk management, potential improvements, and observed patterns.\nSpecific Questions for OpenAI:
        1. Evaluate stop-loss effectiveness, suggest improvements.
        2. Identify and comment on trade patterns.
        3. Provide brief suggestions for entry/exit criteria.
        4. Offer a concise insight to optimize the strategy.`;

      const openai = new OpenAI();

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a stock market expert. ${prompt}`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      const openaiResponse = completion.choices[0];

      res.json({ trades, openaiResponse });
    } catch (err) {
      console.log(err);
    }
  },
  fetchNews: async (req, res) => {
    try {
      const key = process.env.ALPHA_VANTAGE_KEY;
      const symbol = req.query.symbol;
      const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&sort=LATEST&limit=3&apikey=${key}`;

      const response = await fetch(url, {
        headers: { "User-Agent": "node-fetch" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send("Server error");
    }
  },
};
