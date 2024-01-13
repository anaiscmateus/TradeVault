import mongoose from "mongoose"

const TestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
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

const Test = mongoose.model("Test", TestSchema)
export { Test }