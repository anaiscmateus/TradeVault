// User.js
import bcrypt from "bcrypt"
import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  accountBalance: { type: Number, default: 0 }
})

// Password hash middleware
UserSchema.pre("save", async function save(next) {
  const user = this
  if (!user.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password, salt)
    user.password = hash
    next()
  } catch (err) {
    next(err)
  }
})

// Helper method for validating user's password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
  } catch (err) {
    throw err
  }
}

const User = mongoose.model("User", UserSchema)
export { User }