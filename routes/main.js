const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const tradesController = require("../controllers/trades");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/dashboard", ensureAuth, tradesController.getDashboard);
router.get("/news", ensureAuth, tradesController.getNewsPage);
router.get("/api/data", ensureAuth, tradesController.fetchData);
router.get("/ai", ensureAuth, tradesController.getAIPage);
router.get("/feedback", ensureAuth, tradesController.openAI);
router.get("/stock-news", ensureAuth, tradesController.fetchNews);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
