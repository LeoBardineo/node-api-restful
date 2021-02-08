const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')

const UserController = require('../controllers/UserController')

router.get('/', UserController.getAll)
router.get('/:id', UserController.getById)
router.post('/signup', UserController.signUp)
router.post('/login', UserController.login)
// checar se o usuário que fez o request é o mesmo usuário que vai ser deletado
router.delete('/:id', checkAuth, UserController.delete)

module.exports = router
