const express = require('express')
const checkAuth = require('../middleware/check-auth')
const router = express.Router()

const OrderController = require('../controllers/OrderController')

router.get('/', checkAuth, OrderController.getAll)
router.get('/:orderId', checkAuth, OrderController.getById)
router.post('/', checkAuth, OrderController.create)
router.delete('/:orderId', checkAuth, OrderController.delete)

module.exports = router
