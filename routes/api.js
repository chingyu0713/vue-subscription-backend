const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel_pg')

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

router.get('/user/profile', authenticateToken, async (req, res) => {
  const dbUser = await userModel.findUserById(req.user.userId)
  const isStillSubscribed = dbUser.subscribed && dbUser.subscribed_at &&
    new Date() - new Date(dbUser.subscribed_at) < 30 * 24 * 60 * 60 * 1000
  res.json({
    name: dbUser.name,
    email: dbUser.email,
    subscribed: isStillSubscribed,
    expiredDate: isStillSubscribed
      ? new Date(new Date(dbUser.subscribed_at).getTime() + 30 * 24 * 60 * 60 * 1000)
      : null
  })
})

router.post('/subscribe', authenticateToken, async (req, res) => {
  const user = await userModel.updateSubscription(req.user.userId)
  const newToken = jwt.sign({
    userId: user.id,
    name: user.name,
    email: user.email,
    subscribed: true,
    subscribedAt: user.subscribed_at
  }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token: newToken })
})

module.exports = router

