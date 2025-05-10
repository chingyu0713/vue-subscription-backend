// 📦 載入 mongoose，用來建立資料模型（schema）
const mongoose = require('mongoose')

// 🧾 建立「會員資料表格」欄位
const userSchema = new mongoose.Schema({
  googleId: String,          // ✅ Google 登入用戶的唯一 ID
  name: String,              // ✅ 使用者名稱（來自 Google）
  email: String,             // ✅ 使用者 email
  subscribed: {              // ✅ 是否訂閱
    type: Boolean,
    default: false
  },
  subscribedAt: Date         // ✅ 記錄訂閱開始的時間（用來判斷是否過期）
})

// 🧱 匯出 User 模型，可以拿來查 / 新增 / 修改會員資料
module.exports = mongoose.model('User', userSchema)
