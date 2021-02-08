const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')

module.exports = {

  async getAll (req, res, next) {
    const orders = await Order.find().select('product quantity _id').populate('product', 'name')

    if (!orders.length) {
      return res.status(200).json({ message: 'No results found' })
    }

    const response = {
      count: orders.length,
      orders: orders.map(order => {
        return {
          ...order._doc,
          links: [
            {
              type: 'GET',
              rel: 'self',
              href: `http://localhost:${process.env.PORT}/orders/${order.id}`
            },
            {
              type: 'DELETE',
              rel: 'order_delete',
              href: `http://localhost:${process.env.PORT}/orders/${order.id}`
            }
          ]
        }
      })
    }
    res.status(200).json(response)
  },

  async getById (req, res, next) {
    const { orderId } = req.params
    const result = await Order.findById(orderId).select('product quantity _id').populate('product', 'name price _id')

    if (!result) {
      return res.status(200).json({ message: 'No results found' })
    }

    const response = {
      ...result._doc,
      links: [
        {
          type: 'GET',
          rel: 'self',
          href: `http://localhost:${process.env.PORT}/products/${orderId}`
        },
        {
          type: 'DELETE',
          rel: 'product_delete',
          href: `http://localhost:${process.env.PORT}/products/${orderId}`
        }
      ]
    }

    res.status(200).json(response)
  },

  async create (req, res, next) {
    try {
      const { productId, quantity } = req.body
      const validProduct = await Product.findById(productId)

      if (!validProduct) return res.status(404).json('Product not found')

      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product: productId,
        quantity
      })

      await order.save()

      const response = {
        links: [
          {
            type: 'GET',
            rel: 'self',
            href: `http://localhost:${process.env.PORT}/orders/${order._id}`
          },
          {
            type: 'DELETE',
            rel: 'order_delete',
            href: `http://localhost:${process.env.PORT}/orders/${order._id}`
          }
        ]
      }

      res.status(201).json(response)
    } catch (error) {
      console.log(error)
      res.status(500).json({
        error
      })
    }
  },

  async delete (req, res, next) {
    const { orderId } = req.params

    // checar se não existe o produto, se é um id valido

    await Order.deleteOne({ _id: orderId })

    const response = {
      message: 'Order deleted',
      links: [
        {
          type: 'POST',
          rel: 'order_create',
          href: 'http://localhost:3000/orders',
          body: { productId: 'ID', quantity: 'Number' }
        }
      ]
    }

    res.status(200).json(response)
  }

}
