import express from "express"
import { upload } from "../middleware/multer.js"
import { 
    test,
    getPosts,
    likePost,
    deletePost
} from "../controllers/test.js"

const router = express.Router()

// CREATE
router.post("/api/test", upload.single("file"), test)

// READ
router.get("/api/getPosts", getPosts)

// UPDATE
router.put("/api/likePost/:id", likePost)

// DELETE
router.delete("/api/deletePost/:id", deletePost)

export { router }