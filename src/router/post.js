const express = require('express')
const router = express.Router()
var multer = require('multer')
var upload = multer({ dest: 'src/public/images/post' })
const accountMiddlewares = require('..//app/middlewarses/AccountMiddlewarses')
const postController = require('../app/controller/PostController')


var maxSize = 83886080  // 10MB
var uploadImgPost = upload.fields([{ name: 'image1', maxCount: 1, limits: { fileSize: maxSize } },
{ name: 'image2', maxCount: 1, limits: { fileSize: maxSize } }, { name: 'image3', maxCount: 1, limits: { fileSize: maxSize } }])
router.get('/detail/:postID', postController.detail)
router.get('/create', accountMiddlewares.checklogged, postController.create)
router.get('/create', accountMiddlewares.checklogged, postController.create)
router.get('/edit/:postID', accountMiddlewares.checklogged, uploadImgPost, postController.edit)

router.post('/create', accountMiddlewares.checklogged, uploadImgPost, postController.store)
router.post('/handal-from-action', accountMiddlewares.checklogged, postController.handalFromAction)
router.put('/edit/:postID', accountMiddlewares.checklogged, uploadImgPost, postController.update)
router.post('/delete/:postID', accountMiddlewares.checklogged, postController.delete)
router.post('/restore/:postID', accountMiddlewares.checklogged, postController.restore)
router.post('/destroy/:postID', accountMiddlewares.checklogged, postController.destroy)
// postController.store
module.exports = router