const GoogleStrategy = require('passport-google-oauth20').Strategy
const passport = require('passport')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel_pg')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  const user = await userModel.upsertUser(profile.id, profile.displayName, profile.emails[0].value)
  const token = jwt.sign({
    userId: user.id,
    name: user.name,
    email: user.email,
    subscribed: user.subscribed,
    subscribedAt: user.subscribed_at
  }, process.env.JWT_SECRET, { expiresIn: '7d' })
  done(null, token)
}))