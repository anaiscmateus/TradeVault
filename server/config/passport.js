// passport.js
import { Strategy as LocalStrategy } from "passport-local"
import { User } from "../models/User.js"

export const configurePassport = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() })

          if (!user) {
            return done(null, false, { msg: `Email ${email} not found.` })
          }

          if (!user.password) {
            return done(null, false, {
              msg: "Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile."
            })
          }

          const isMatch = await user.comparePassword(password)

          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false, { msg: "Invalid email or password." })
          }
        } catch (err) {
          return done(err)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  })
}