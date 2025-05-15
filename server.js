const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const passport = require('passport')
require('./config/passport')

app.use(cors())
app.use(express.json())
app.use(passport.initialize())
app.use('/auth', require('./routes/auth'))
app.use('/api', require('./routes/api'))

app.listen(3000, () => {
  console.log('🚀 Server 正在 http://localhost:3000 運行中')
})
