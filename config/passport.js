// 📦 載入 Google 登入策略的工具包，這是專門給 passport 用的 Google OAuth 2.0 插件
const GoogleStrategy = require('passport-google-oauth20').Strategy

// 📦 載入 passport 本體，用來幫我們處理登入流程
const passport = require('passport')

// 📦 載入 jsonwebtoken，登入成功後會發 token 給使用者當「會員卡」
const jwt = require('jsonwebtoken')

// 📦 載入自己定義的 User 資料模型，之後要查資料庫就靠它
const User = require('../models/User')


// 📌 告訴 passport 要用 Google 登入策略（GoogleStrategy）
//    帶入 clientID、clientSecret、callbackURL 都來自 .env
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,          // ✅ 這是 Google 給我們的「登入金鑰」
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,  // ✅ 用來驗證身份的「私鑰」
  callbackURL: process.env.GOOGLE_CALLBACK_URL     // ✅ 登入成功後 Google 要 redirect 回來的網址
},

/// ✅ 這個函式就是「登入成功後」會自動被呼叫的邏輯處理
// 生活比喻：使用者登入後，Google 拿著身分證過來，我們這邊要決定怎麼幫他開會員卡、登記資料
  // 📝 註解：accessToken 是 Google 給的「短期通行證」，refreshToken 是「用來延長通行證的票」
  //       這邊我們沒有用它們，只是用 profile 裡的名字和 email 來建立會員資料
async (accessToken, refreshToken, profile, done) => {
  // 🧠 檢查這個 googleId（Google 的身分證字號）有沒有出現在我們的會員資料庫
  // 👉 有的話更新他的資料（name、email），沒有的話就新增一筆（upsert）
  const user = await User.findOneAndUpdate(
    { googleId: profile.id },              // 🔍 找看看 googleId 一樣的人
    {
      name: profile.displayName,           // ✍️ 把 Google 傳來的名字寫進資料庫
      email: profile.emails[0].value       // ✍️ 同上，把 email 記下來
    },
    { upsert: true, new: true }            // 📌 沒找到就新增，有的話更新後回傳新的
  )

  // ✅ 做好會員資料後，要發一張 token 給使用者，代表他是我們的會員（JWT 會員卡）
  const token = jwt.sign({
    userId: user._id,              // ➕ 我們系統內的 ID
    name: user.name,               // ➕ 使用者名稱
    email: user.email,             // ➕ Email
    subscribed: user.subscribed,   // ➕ 是否訂閱
    subscribedAt: user.subscribedAt // ➕ 訂閱日期（若有的話）
  }, process.env.JWT_SECRET, { expiresIn: '7d' })  // 🗝️ 用秘密金鑰加密，有效期 7 天

  // ✅ 把這個 token 傳給 passport 系統，之後會自動放在 req.user 裡
  done(null, token)
}))
