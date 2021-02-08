const mongoose = require('mongoose')
const Product = require('../models/Product')

module.exports = {

  async getAll (req, res, next) {
    const products = await Product.find().select('name price _id productImage')

    if (!products.length) {
      return res.status(200).json({ message: 'No results found' })
    }

    const response = {
      count: products.length,
      products: products.map(product => {
        return {
          ...product._doc,
          links: [
            {
              type: 'GET',
              rel: 'self',
              href: `http://localhost:${process.env.PORT}/products/${product.id}`
            },
            {
              type: 'PATCH',
              rel: 'product_update',
              href: `http://localhost:${process.env.PORT}/products/${product.id}`
            },
            {
              type: 'DELETE',
              rel: 'product_delete',
              href: `http://localhost:${process.env.PORT}/products/${product.id}`
            }
          ]
        }
      })
    }
    res.status(200).json(response)
  },

  async getById (req, res, next) {
    const { productId } = req.params
    const result = await Product.findById(productId).select('name price _id productImage')

    if (!result) {
      return res.status(200).json({ message: 'No results found' })
    }

    const response = {
      ...result._doc,
      links: [
        {
          type: 'GET',
          rel: 'self',
          href: `http://localhost:${process.env.PORT}/products/${productId}`
        },
        {
          type: 'PATCH',
          rel: 'product_update',
          href: `http://localhost:${process.env.PORT}/products/${productId}`
        },
        {
          type: 'DELETE',
          rel: 'product_delete',
          href: `http://localhost:${process.env.PORT}/products/${productId}`
        }
      ]
    }

    res.status(200).json(response)
  },

  async create (req, res, next) {
    const { name, price } = req.body

    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name,
      price,
      productImage: req.file.path
    })

    await product.save()

    const response = {
      links: [
        {
          type: 'GET',
          rel: 'self',
          href: `http://localhost:${process.env.PORT}/products/${product._id}`
        },
        {
          type: 'PATCH',
          rel: 'product_update',
          href: `http://localhost:${process.env.PORT}/products/${product._id}`
        },
        {
          type: 'DELETE',
          rel: 'product_delete',
          href: `http://localhost:${process.env.PORT}/products/${product._id}`
        }
      ]
    }

    res.status(201).json(response)
  },

  async update (req, res, next) {
    const { productId } = req.params
    const updateOps = {}

    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value
    }

    await Product.updateOne({ _id: productId }, { $set: updateOps })

    const response = {
      links: [
        {
          type: 'GET',
          rel: 'self',
          href: `http://localhost:${process.env.PORT}/products/${productId}`
        },
        {
          type: 'PATCH',
          rel: 'product_update',
          href: `http://localhost:${process.env.PORT}/products/${productId}`
        },
        {
          type: 'DELETE',
          rel: 'product_delete',
          href: `http://localhost:${process.env.PORT}/products/${productId}`
        }
      ]
    }

    res.status(200).json(response)
  },

  async delete (req, res, next) {
    const { productId } = req.params

    await Product.deleteOne({ _id: productId })

    const response = {
      message: 'Product deleted',
      links: [
        {
          type: 'POST',
          rel: 'product_create',
          href: 'http://localhost:3000/products',
          body: { name: 'String', price: 'Number' }
        }
      ]
    }

    res.status(200).json(response)
  }

}
