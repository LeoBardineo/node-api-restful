const express = require('express')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')
const router = express.Router()
const mimetypeAccepted = ['image/jpeg', 'image/png']
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + file.originalname)
  }
})
const fileFilter = (req, file, cb) => {
  if (!mimetypeAccepted.includes(file.mimetype)) return cb(null, false)
  cb(null, true)
}
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
})

const ProductController = require('../controllers/ProductController')

router.get('/', ProductController.getAll)
router.get('/:productId', ProductController.getById)
router.post('/', checkAuth, upload.single('productImage'), ProductController.create)
router.patch('/:productId', checkAuth, ProductController.update)
router.delete('/:productId', checkAuth, ProductController.delete)

module.exports = router
