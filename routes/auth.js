const express = require('express')
const passport = require('passport')
const router = express.Router()

// 🔐 1. 使用 Google 登入
// 前端點這個網址就會跳去 Google 登入畫面
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'] // 👉 passport 幫我用 Google 登入，要求使用者提供這兩項資料
  })
)

// 🔁 2. Google 登入完成後，會跳回來這個路由，passport 幫我檢查 Google 回來的人是不是合法的，我們不用 session（我們用的是 JWT）
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // ✅ 登入成功後，把 token 帶回前端（塞進網址上）
    res.redirect(`http://localhost:5173/?token=${req.user}`)
  }
)

module.exports = router
