const User = require("..//models/User");
const Department = require("..//models/Department");
const Subject = require("..//models/Subject");
const Post = require("../models/Post");
const { mutipleMongooseToObject } = require("..//..//util/mongoose");
const { mongooseToObject } = require("..//..//util/mongoose");
const fs = require("fs");
const { exception } = require("console");
const convertText = require('..//..//util/convertText')
const { deleteFile, deleteFiles, getFileStream } = require("..//..//config/aws/s3")
const maxPrice = 500000;
const minPrice = 0;
const maxQuantity = 999;
const minQuantity = 1;


class PostController {
    // [GET] post/getimage:key
    async getImage(req, res) {
            try {
                const { key } = req.params
                const resultImage = await getFileStream(key)
                if (resultImage.length == 0) {
                    res.status(500).send()
                    return
                }
                resultImage.pipe(res)
            } catch (error) {
                res.status(500).send()
            }
        }
        // [GET] /[post]/detail
    detail(req, res, next) {
            var postID = req.params.postID
            if (!postID) {
                renderErrorPage(res, '404', 'Không tìm thấy trang')
                return
            }
            Post.find({ _id: postID }).populate('owner')
                .then(async function(post) {
                    if (post == null) {
                        renderErrorPage(res, '404', 'Tin đăng không tồn tại')
                        return
                    }
                    res.render('post/detailPost', {
                        post: mutipleMongooseToObject(post)[0],
                        image1: post[0].images[0],
                        image2: post[0].images[1],
                        image3: post[0].images[2],
                        formatMoneyVN: convertText.money(post[0].price),
                        timeAgo: convertText.timeAgo(post[0].createdAt)
                    })
                })
                .catch((err) => {
                    renderErrorPage(res, 'ERROR')
                })
        }
        // [GET] /post/create
    create(req, res, next) {
            res.render("post/createPost");
        }
        // [POST] /post/store
    store(req, res, next) {
            //   = 10MB
            var post = new Post(req.body);
            post.owner = req.user._id;

            const { image1, image2, image3 } = req.files
            if (image1) {
                post.images.push(image1[0].key);
            }
            if (image2) {
                post.images.push(image2[0].key);
            }
            if (image3) {
                post.images.push(image3[0].key)
            }
            if (post.images.length == 0) {
                renderError("Thêm không thành công", "File ảnh của bạn có vấn đề gì đó");
                return;
            }


            if (
                post.price == undefined ||
                post.price > maxPrice ||
                post.price < minPrice ||
                post.quantity == undefined ||
                post.quantity > maxQuantity ||
                post.quantity < minQuantity
            ) {
                renderError(
                    "Thêm không thành công",
                    "Dữ liệu (Giá hoặc Số lượng) của bạn nhập có vấn đề gì đó"
                );
                deleteImages();
                return;
            }
            post.englishAlphabetLowercased = convertText.englishAlphabetLowercased(post.name)
            post
                .save({})
                .then(function() {
                    res.redirect('/me/posted')
                })
                .catch(function(err) {
                    renderError(
                        "Thêm không thành công",
                        "Dữ liệu của bạn nhập có vấn đề gì đó"
                    );
                    deleteImages();
                    return;
                });

            function renderError(title, content) {
                res.render("post/announcePost", {
                    title: title,
                    content: content,
                });
            }

            function deleteImages() {
                deleteFiles([image1, image2, image3])
            }
        }
        // [GET] post/edit:postID
    edit(req, res, next) {
            var id = req.params.postID;
            var owner = req.user._id;
            if (id) {
                Post.find({ _id: id, owner })
                    .then(function(post) {
                        if (post) {
                            res.render("post/editPost", {
                                post: mongooseToObject(post),
                                postID: id,
                            });
                        } else {
                            renderError("404", _id + " Không tồn tại");
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                        renderError("ERROR : 404", "Trang Không tồn tại");
                    });
            } else {
                renderError("404", "Trang không tồn tại");
            }

            function renderError(title, content) {
                res.render("post/announcePost", {
                    title: title,
                    content: content,
                });
            }
        }
        // [PUT] post.edit:postID
    update(req, res, next) {
        var id = req.params.postID;
        var userID = req.user._id;
        var deleteFilesArray = [];
        const { image1, image2, image3 } = req.files
            // , owner: userID
        Post.findOne({ _id: id, owner: userID })
            .then(function(postOld) {
                if (!postOld) {
                    throw new exception();
                }
                var post = req.body;
                post.owner = userID;
                post.images = [];
                if (image1) {
                    post.images.push(image1[0].key)
                    if (postOld.images[0]) deleteFilesArray.push(postOld.images[0]);
                } else {
                    post.images.push(postOld.images[0]);
                }
                if (image2) {
                    post.images.push(image2[0].key)
                    if (postOld.images[1]) deleteFilesArray.push(postOld.images[1]);
                } else {
                    post.images.push(postOld.images[1]);
                }
                if (image3) {
                    post.images.push(image3[0].key)
                    if (postOld.images[2]) deleteFilesArray.push(postOld.images[2]);
                } else {
                    post.images.push(postOld.images[2]);
                }

                if (
                    post.price == undefined ||
                    post.price > maxPrice ||
                    post.price < minPrice ||
                    post.quantity == undefined ||
                    post.quantity > maxQuantity ||
                    post.quantity < minQuantity
                ) {
                    throw new exception(
                        "Dữ liệu (Giá hoặc Số lượng) của bạn nhập có vấn đề gì đó"
                    );
                }
                return Post.updateOne({ _id: id }, post);
            })
            .then(function() {
                deleteFilesArrayFunction(deleteFilesArray);
                res.redirect("/me/posted");
            })
            .catch(function(err) {
                deleteImages();
                renderError("ERROR 404", "thiếu dữ liệu đâu vào 2" + err);
            });

        function renderError(title, content) {
            res.render("post/announcePost", {
                title: title,
                content: content,
            });
        }

        function deleteFilesArrayFunction(files) {
            if (files || files.length > 0) {
                deleteFiles(files)
            }
        }

        function deleteImages() {
            deleteFiles([image1, image2, image3])
        }
    }

    // [POST] /post/detlete/:postID
    delete(req, res, next) {
            var id = req.params.postID;
            var userID = req.user._id;
            Post.delete({ _id: id, owner: userID })
                .then(function() {
                    res.redirect('back')
                })
        }
        // [POST] /post/restore/:postID
    restore(req, res, next) {
            var id = req.params.postID;
            var userID = req.user._id;
            Post.restore({ _id: id, owner: userID })
                .then(function() {
                    res.redirect('back')
                })
        }
        // [POST] /post/destroy/:postID
    destroy(req, res, next) {
            var id = req.params.postID;
            var userID = req.user._id;
            Post.findOne({ _id: id, owner: userID })
                .then(function(post) {
                    deleteFiles(post.images)
                    return Post.deleteOne({ _id: id, owner: userID })
                })
                .then(function() {
                    res.redirect('back')
                })
        }
        // [POST]/handal-From-Action
    handalFromAction(req, res, next) {
        var userID = req.user._id;

        switch (req.body.action) {
            case 'delete':
                {
                    Post.delete({ _id: { $in: req.body.checkItems }, owner: userID })
                    .then(() => {
                        res.redirect('back')
                    })
                    break
                }
            case 'restore':
                {
                    console.log('asdasd' + req.body.checkItems)
                    Post.restore({ _id: { $in: req.body.checkItems }, owner: userID })
                    .then(() => {
                        res.redirect('back')
                    })
                    break
                }
            case 'destroy':
                {
                    // xoa file anh truoc 
                    Post.find({ _id: { $in: req.body.checkItems }, owner: userID })
                    .then((posts) => {
                        posts.forEach((post) => {
                            post.images.forEach((image) => {
                                fs.unlink('src/public/' + image, function(err) {
                                    if (err)
                                        console.log('File khong ton tai')
                                })
                            })
                        })
                    })
                    .catch(next)
                    Post.deleteMany({ _id: { $in: req.body.checkItems }, owner: userID })
                    .then(() => {
                        res.redirect('back')
                    })
                    .catch(next)
                    break
                }
            default:
                {
                    res.redirect('back')
                }
        }
    }
}

function renderErrorPage(res, title, content) {
    res.render("post/announcePost", {
        title: title,
        content: content,
    });
}
module.exports = new PostController();