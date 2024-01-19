import express from "express"
import { upload } from "../middleware/multer.js"
import { 
    createPost,
    getPosts,
    likePost,
    deletePost
} from "../controllers/posts.js"

const router = express.Router()

// CREATE
router.post("/api/createPost", upload.single("file"), createPost)

// READ
router.get("/api/getPosts", getPosts)

// UPDATE
router.put("/api/likePost/:id", likePost)

// DELETE
router.delete("/api/deletePost/:id", deletePost)

export { router }