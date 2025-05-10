// 🔹 引入 express，建立一個後端伺服器
const express = require('express')
const app = express()

// 🔹 引入 dotenv 套件，幫我們讀取 .env 中的私密設定
require('dotenv').config()

// 🔹 引入 cors，讓前端可以合法連到這台伺服器
const cors = require('cors')
app.use(cors()) // ✅ 開放所有來源連線，開發階段這樣就夠

// 🔹 引入 mongoose（連接 MongoDB）
const mongoose = require('mongoose')

// 🔹 引入 passport（登入系統）
const passport = require('passport')
require('./config/passport') //啟用 passport，這是一個專門幫你處理登入檢查的守門員。我們叫他讀設定檔（./config/passport）知道怎麼處理 Google 登入。

// 🔹 讓 Express 伺服器能讀懂 JSON 請求
app.use(express.json())

// 🔹 啟用 passport 中介層
app.use(passport.initialize())

// 🔹 設定 /auth 這條路線是用來「登入」的，詳細規則寫在 routes/auth.js。
app.use('/auth', require('./routes/auth'))

// 🔹 註冊訂閱與查詢資料的 API
app.use('/api', require('./routes/api'))

// 🔹 接上 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB 連線成功')
    app.listen(3000, () => {
      console.log('🚀 Server 正在 http://localhost:3000 運行中')
    })
  })
  .catch(err => {
    console.error('❌ MongoDB 連線失敗：', err)
  })
