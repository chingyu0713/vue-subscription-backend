// 📦 引入 express（伺服器框架）來建立路由
const express = require('express')
const router = express.Router()

// 📦 引入 JWT 工具，用來驗證和產生會員卡（token）
const jwt = require('jsonwebtoken')

// 📦 引入我們自己設計的會員資料表（MongoDB 資料模型）
const User = require('../models/User')


// 🧱 守門員：確認使用者的 token 合法性（token 是會員卡）
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']  // 💬 從 request 的標頭中拿出授權欄位
  const token = authHeader && authHeader.split(' ')[1] // ✂️ 擷取出真正的 token（格式像 Bearer xxx）

  if (!token) return res.sendStatus(401) // 🛑 沒帶會員卡 ➜ 不讓進入

  // ✅ 核對會員卡內容（確保沒有偽造）
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) // 🧨 卡無效或被竄改 ➜ 禁止訪問

    req.user = user // 👤 把核對過的會員資訊放進 request 中，讓下一段可以用
    next() // 🚶‍♂️ 放行，繼續執行下一段 API 處理
  })
}


// 👤 API: 查詢目前使用者的基本資料和訂閱狀態
router.get('/user/profile', authenticateToken, async (req, res) => {
  // 🗂️ 根據 token 裡的 userId，從資料庫找到這位會員
  const dbUser = await User.findById(req.user.userId)

  // 📆 判斷是否還在訂閱中（訂閱起始時間在 30 天內）
  const isStillSubscribed =
    dbUser.subscribed &&                            // ✅ 有訂閱
    dbUser.subscribedAt &&                          // ✅ 有訂閱時間
    new Date() - new Date(dbUser.subscribedAt) <    // ✅ 現在時間 - 訂閱時間 < 30 天（以毫秒計算）
    30 * 24 * 60 * 60 * 1000

  // 📦 回傳會員資訊給前端
  res.json({
    name: dbUser.name,
    email: dbUser.email,
    subscribed: isStillSubscribed,  // ✅ true = 有效訂閱 / false = 過期
    expiredDate: isStillSubscribed
    ? new Date(new Date(dbUser.subscribedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null, // 📅 計算過期時間（如果有訂閱的話）
  })
})


// 💸 API: 使用者點下「我要訂閱」按鈕後會觸發這段
router.post('/subscribe', authenticateToken, async (req, res) => {
  // 🔍 根據會員卡中的 userId，查找對應的會員資料
  const user = await User.findById(req.user.userId)
  if (!user) return res.sendStatus(404) // ❌ 找不到人，回傳 404

  // ✅ 更新會員資料：設定已訂閱，記下訂閱的時間
  user.subscribed = true
  user.subscribedAt = new Date()
  await user.save() // 💾 存進 MongoDB 資料庫

  // 🔁 幫他重新發一張會員卡（因為剛剛訂閱了，要更新卡上的資料）
  const newToken = jwt.sign({
    userId: user._id,               // 🆔 這是 MongoDB 產生的會員 ID
    name: user.name,                // 📛 使用者名稱
    email: user.email,              // 📧 使用者 email
    subscribed: true,               // ✅ 已訂閱
    subscribedAt: user.subscribedAt // 🕓 訂閱的時間
  }, process.env.JWT_SECRET, { expiresIn: '7d' }) // 🗝️ 用秘密金鑰簽名，設定 7 天後過期

  // 📦 把新的會員卡傳給前端（前端會更新存在 localStorage 的 token）
  res.json({ token: newToken })
})

// 🚪 把這組路由功能匯出，讓 server.js 可以載入它
module.exports = router
// Compare this snippet from server.js: