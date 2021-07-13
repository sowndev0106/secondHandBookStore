const express = require('express')
const router = express.Router()
var multer = require('multer')
var upload = multer({ dest: 'src/public/images/post' })

// khoi tao controller
var maxSize = 83886080  // 10MB
var uploadImgPost = upload.fields([{ name: 'image1', maxCount: 1, limits: { fileSize: maxSize } },
{ name: 'image2', maxCount: 1, limits: { fileSize: maxSize } }, { name: 'image3', maxCount: 1, limits: { fileSize: maxSize } }])

const postController = require('../app/controller/PostController')
router.get('/create', postController.create)
router.get('/edit/:postID', uploadImgPost, postController.edit)

router.post('/create', uploadImgPost, postController.store)
router.post('/handal-from-action', postController.handalFromAction)
router.put('/edit/:postID', uploadImgPost, postController.update)
router.post('/delete/:postID', postController.delete)
router.post('/restore/:postID', postController.restore)
router.post('/destroy/:postID', postController.destroy)
// postController.store
module.exports = router