const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
const port = process.env.PORT || 3000

// CORS
app.use(cors())

app.use('/uploads', express.static('uploads'))

// Log das requisições feitas
app.use(morgan('dev'))

// body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Routes
const productRoutes = require('./src/routes/products')
const orderRoutes = require('./src/routes/orders')
const userRoutes = require('./src/routes/users')

mongoose.connect(
  `mongodb+srv://leobardo:${process.env.DB_PASS}@cluster0.z7bzq.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
)

app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/users', userRoutes)

// Endpoint não encontrado
app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

// Error handling
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message || "500 - Something's wrong"
    }
  })
})

app.listen(port) // mesma coisa que o http.createServer
