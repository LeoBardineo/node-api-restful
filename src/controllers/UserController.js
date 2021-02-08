const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = {

  async getAll (req, res, next) {
    const users = await User.find().select('_id email password')

    if (!users.length) {
      return res.status(200).json({ message: 'No results found' })
    }

    const response = {
      count: users.length,
      users: users.map(user => {
        return {
          ...user._doc,
          links: [
            {
              type: 'GET',
              rel: 'self',
              href: `http://localhost:${process.env.PORT}/users/${user.id}`
            },
            {
              type: 'DELETE',
              rel: 'user_delete',
              href: `http://localhost:${process.env.PORT}/users/${user.id}`
            }
          ]
        }
      })
    }
    res.status(200).json(response)
  },

  async getById (req, res, next) {
    const { userId } = req.params
    const result = await User.findById(userId).select('_id email password')

    if (!result) {
      return res.status(200).json({ message: 'No results found' })
    }

    const response = {
      ...result._doc,
      links: [
        {
          type: 'GET',
          rel: 'self',
          href: `http://localhost:${process.env.PORT}/users/${userId}`
        },
        {
          type: 'PATCH',
          rel: 'user_update',
          href: `http://localhost:${process.env.PORT}/users/${userId}`
        },
        {
          type: 'DELETE',
          rel: 'user_delete',
          href: `http://localhost:${process.env.PORT}/users/${userId}`
        }
      ]
    }

    res.status(200).json(response)
  },

  async signUp (req, res, next) {
    try {
      const { email } = req.body

      const regexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

      if (!email.match(regexEmail)) return res.status(400).json({ message: 'Email invalid' })

      const alreadyExist = await User.find({ email })

      if (alreadyExist.length >= 1) return res.status(409).json({ message: 'Email already exists' })

      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) {
          return res.status(500).json({ error: err })
        } else {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email,
            password: hash
          })
          await user.save()
          res.status(201).json({ message: 'User created', user })
        }
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Uh, something went wrong...' })
    }
  },

  async login (req, res, next) {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) return res.status(401).json({ message: 'Auth failed' })

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(401).json({ message: 'Auth failed' })
      if (result) {
        const token = jwt.sign({
          email: user.email,
          userId: user._id
        }, process.env.JWT_KEY, {
          expiresIn: '1h'
        })
        return res.status(200).json({ message: 'Auth successful', token })
      }
      res.status(401).json({ message: 'Auth failed' })
    })
  },

  async delete (req, res, next) {
    await User.remove({ _id: req.params.userId })
    res.status(200).json({ message: 'User deleted' })
  }

}
