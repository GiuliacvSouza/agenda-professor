const express = require('express')
const cors = require('cors')

const app = express()

const authRoutes = require('./src/routes/auth.routes')
const userRoutes = require('./src/routes/user.routes')
const bookingRoutes = require('./src/routes/booking.routes')
const notificationRoutes = require('./src/routes/notification.routes')
const cursoRoutes = require('./src/routes/curso.routes')

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

console.log("APP IMPORTADO");

// Rota pública para listar cursos sem autenticação (necessária para formulário de registro)
const Course = require('./src/models/Course');
app.get('/api/public-cursos', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/cursos', cursoRoutes)

module.exports = app