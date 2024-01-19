import mongoose from "mongoose"

const PostSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  cloudinaryId: {
    type: String,
    require: true
  },
  likes: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
})

const Post = mongoose.model("Post", PostSchema)
export { Post }