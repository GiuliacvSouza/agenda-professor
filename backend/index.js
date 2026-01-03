const express = require('express')
const cors = require('cors')

const app = express()

const authRoutes = require('./src/routes/auth.routes')

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log("➡️", req.method, req.url)
  next()
})

console.log("APP IMPORTADO");
app.use('/api/auth', authRoutes)


module.exports = app