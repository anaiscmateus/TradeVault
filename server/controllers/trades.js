import { cloudinary } from "../middleware/cloudinary.js";
import { Trade } from "../models/Trade.js";
import { User } from "../models/User.js";
import OpenAI from "openai";
import pkg from "mongodb";
const { ObjectID } = pkg;
import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });

// add new trade
export const createTrade = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });

    let image;
    // check if the user uploaded a file, if yes upload to cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      image = {
        url: result.url,
        public_id: result.public_id,
      };
    }

    const newTrade = await Trade.create({
      market: req.body.market,
      initialPurchaseDate: req.body.date,
      symbol: req.body.symbol,
      direction: req.body.direction,
      quantity: req.body.qty,
      initialPurchasePrice: req.body.entryPrice,
      notes: req.body.notes,
      open: true,
      imageUrl: image.url || null,
      cloudinaryId: image.public_id || null,
      transactions: [
        {
          action: "BUY",
          quantity: req.body.qty,
          price: req.body.entryPrice,
          total: req.body.entryPrice * req.body.qty,
          date: req.body.date,
          stopLoss: req.body.stopLoss,
        },
      ],
      position: req.body.entryPrice * req.body.qty,
      user: req.user.id,
    });

    // update account balance
    user.accountBalance =
      user.accountBalance - req.body.entryPrice * req.body.qty;

    // update data
    await user.save();
    await Trade.create(newTrade);

    res.status(200).send({
      message: "Success!",
      data: newTrade,
      updatedBalance: user.accountBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "An error occurred", error: err.message });
  }
};

// fetch trades
export const fetchAllTrades = async (req, res) => {
  try {
    // fetch all trades
    const trades = await Trade.find({ user: req.user.id }).sort(
      "initialPurchaseDate"
    );

    let cumulativePnL = 0; // Initialize a variable to track cumulative P&L

    // fetch stats
    const wins = trades.filter((trade) => trade.returnAmount > 0);
    const losses = trades.filter((trade) => trade.returnAmount < 0);
    const totalWinAmount = wins.reduce(
      (sum, trade) => sum + trade.returnAmount,
      0
    );
    const totalLossAmount = losses.reduce(
      (sum, trade) => sum + trade.returnAmount,
      0
    );

    const stats = {
      wins: trades.filter((trade) => trade.returnAmount > 0).length,
      losses: trades.filter((trade) => trade.returnAmount < 0).length,
      avgWin: wins.length > 0 ? totalWinAmount / wins.length : 0,
      avgLoss: losses.length > 0 ? totalLossAmount / losses.length : 0,
    };

    const chartData = trades.map((trade) => {
      if (!trade.open) {
        cumulativePnL += trade.returnAmount; // Update the cumulative P&L

        return {
          date: trade.initialPurchaseDate.toISOString().split("T")[0], // Format date
          cumulativePnL: cumulativePnL,
        };
      }
    });

    chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ trades: trades, stats: stats, chartData: chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// add to position
export const addTradePosition = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
    });

    const user = await User.findOne({ _id: req.user.id });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Validate and parse request body variables
    const quantity = parseInt(req.body.quantity);
    const price = parseFloat(req.body.price);
    const totalCost = quantity * price;

    const transaction = {
      action: "BUY",
      quantity: quantity,
      price: price,
      total: totalCost,
      date: req.body.date,
      stopLoss: req.body.stopLoss,
    };

    trade.transactions.push(transaction);
    trade.quantity += transaction.quantity;
    trade.position += transaction.total;
    trade.stopLoss = transaction.stopLoss;
    trade.notes = req.body.notes;

    user.accountBalance -= totalCost;

    await trade.save();
    await user.save();

    res.json({ trade: trade, user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// sell position
export const sellTradePosition = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
    });

    const user = await User.findOne({ _id: req.user.id });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Validate and parse request body variables
    const quantity = parseInt(req.body.quantity);
    const price = parseFloat(req.body.price);
    const total = quantity * price;

    const transaction = {
      action: "SELL",
      quantity: quantity,
      price: price,
      total: total,
      date: req.body.date,
      stopLoss: req.body.stopLoss,
    };

    trade.transactions.push(transaction);

    trade.quantity -= quantity;

    // Improved remaining position calculation using average purchase price
    const totalBuyValue = trade.transactions
      .filter((t) => t.action === "BUY")
      .reduce((sum, t) => sum + t.total, 0);
    const totalQuantityBought = trade.transactions
      .filter((t) => t.action === "BUY")
      .reduce((sum, t) => sum + t.quantity, 0);
    const averagePurchasePrice =
      totalQuantityBought > 0 ? totalBuyValue / totalQuantityBought : 0;
    const remainingPosition = trade.quantity * averagePurchasePrice;
    trade.position = remainingPosition;

    trade.stopLoss = req.body.stopLoss;
    trade.notes = req.body.notes;

    if (trade.quantity <= 0) {
      trade.open = false;
      const totalSellValue = trade.transactions
        .filter((t) => t.action === "SELL")
        .reduce((sum, t) => sum + t.total, 0);

      trade.returnAmount = totalSellValue - totalBuyValue;
      trade.exitTotal = totalSellValue;

      trade.finalPurchasePrice = price;

      if (totalBuyValue === totalSellValue) {
        trade.returnAmount = 0;
      }

      trade.finalPurchaseDate = req.body.date;
    }

    user.accountBalance += total;

    await trade.save();
    await user.save();

    res.json({ trade: trade, user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// delete trade
export const deleteTrade = async (req, res) => {
  try {
    // Find trade by ID
    const trade = await Trade.findById(req.params.id);

    // Check if trade exists
    if (!trade) {
      return res.status(404).send({ message: "trade not found" });
    }

    // Delete image from cloudinary if it exists
    if (Trade.cloudinaryId) {
      await cloudinary.uploader.destroy(Trade.cloudinaryId);
    }

    // Delete trade from MDB
    await Trade.deleteOne({ _id: req.params.id });

    res.status(200).send({ message: "Trade deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error deleting trade" });
  }
};

// openai
export const openaiFeedback = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.id }).sort(
      "-initialPurchaseDate"
    );
    const lastThreeTrades = trades.slice(0, 3);

    const tradeSummary = lastThreeTrades
      .map((trade) => {
        if (!trade.returnAmount) return null; // Skip trades without returnAmount

        const totalQuantityBought = trade.transactions
          .filter((transaction) => transaction.action === "BUY")
          .reduce((sum, transaction) => sum + transaction.quantity, 0);

        return `$${trade.symbol}, ${
          trade.direction
        }side, ${totalQuantityBought} shares, Entry $${
          trade.transactions[0].price
        }, Stop Loss $${trade.transactions[0].stopLoss}, Exit $${
          trade.transactions[trade.transactions.length - 1].price
        }, Return $${trade.returnAmount}, Notes ${trade.notes}`;
      })
      .filter(Boolean)
      .join("\n");

    const prompt = `I recently executed the following trades:\n${tradeSummary}\nAnalyze these trades and provide brief insights in 3 to 4 concise bullet points, each are STRICTLY limited to 100-125 characters. The bullet points will always be "*". Focus on key aspects like risk management, potential improvements, and observed patterns.\nSpecific Questions for OpenAI:
    1. Evaluate stop-loss effectiveness, suggest improvements.
    2. Identify and comment on trade patterns.
    3. Provide brief suggestions for entry/exit criteria.
    4. Offer a concise insight to optimize the strategy.`;

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: `You are a stock market expert. ${prompt}` },
      ],
      model: "gpt-3.5-turbo",
    });

    const openaiResponse = completion.choices[0];

    res.json({ openaiResponse: openaiResponse });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error processing trades" });
  }
};

export const fetchNews = async (req, res) => {
  try {
    const key = process.env.ALPHA_VANTAGE_KEY;
    const symbol = req.params.symbol;
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&sort=LATEST&limit=4&apikey=${key}`;

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
};
