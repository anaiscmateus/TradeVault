// auth.js
import express from "express"
const router = express.Router()
import {
  getLogin,
  postLogin,
  logout,
  getSignup,
  postSignup,
  updateBalance
} from "../controllers/auth.js"
import { ensureAuth } from "../middleware/auth.js"

import pkg from "mongodb"
const { ObjectID } = pkg

router.get("/login", getLogin)
router.post("/login", postLogin)
router.get("/logout", logout)
router.get("/signup", getSignup)
router.post("/signup", postSignup)
router.post("/updateBalance", updateBalance)

export { router }