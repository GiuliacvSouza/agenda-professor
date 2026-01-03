require('dotenv').config()
const app = require('../index')
const connectDB = require('./config/db')

console.log("🔥 SERVER INICIANDO");

connectDB()


const PORT = process.env.PORT || 3000


app.listen(PORT, () => {
console.log(`Servidor rodando na porta ${PORT}`)
})