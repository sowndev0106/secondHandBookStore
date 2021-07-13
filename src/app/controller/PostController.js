const User = require("..//models/User");
const Department = require("..//models/Department");
const Subject = require("..//models/Subject");
const Post = require("../models/Post");
const moment = require("moment");
const { mutipleMongooseToObject } = require("..//..//util/mongoose");
const { mongooseToObject } = require("..//..//util/mongoose");
const fs = require("fs");
const { exception } = require("console");
const convertText = require('..//..//util/convertText')
const maxPrice = 500000;
const minPrice = 0;
const maxQuantity = 999;
const minQuantity = 1;

class PostController {
  // [GET] /post/create
  create(req, res, next) {
    res.render("post/createPost");
  }
  // [POST] /post/store
  store(req, res, next) {
    //   = 10MB
    var post = new Post(req.body);
    if (req.files.image1) {
      post.images.push(
        "/" + req.files.image1[0].path.split("\\").slice(2).join("/")
      );
    }
    if (req.files.image2) {
      post.images.push(
        "/" + req.files.image2[0].path.split("\\").slice(2).join("/")
      );
    }
    if (req.files.image3) {
      post.images.push(
        "/" + req.files.image3[0].path.split("\\").slice(2).join("/")
      );
    }
    if (post.images.length == 0) {
      renderError("Thêm không thành công", "File ảnh của bạn có vấn đề gì đó");
      return;
    }
    post.owner = req.cookies.userID;
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
      .then(function () {
        res.redirect('/me/posted')
      })
      .catch(function (err) {
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
      if (req.files.image1) {
        try {
          fs.unlinkSync(req.files.image1[0].path);
        } catch (err) {
          console.error(err);
        }
      }
      if (req.files.image2) {
        try {
          fs.unlinkSync(req.files.image2[0].path);
        } catch (err) {
          console.error(err);
        }
      }
      if (req.files.image3) {
        try {
          fs.unlinkSync(req.files.image3[0].path);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  // [GET] post/edit:postID
  edit(req, res, next) {
    var id = req.params.postID;
    if (id) {
      Post.find({ _id: id })
        .then(function (post) {
          if (post) {
            res.render("post/editPost", {
              post: mongooseToObject(post),
              postID: id,
            });
          } else {
            renderError("404", _id + " Không tồn tại");
          }
        })
        .catch(function (err) {
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
    var userID = req.cookies.userID;
    var deleteFiles = [];
    // , owner: userID
    Post.findOne({ _id: id })
      .then(function (postOld) {
        console.log(postOld);
        if (!postOld) {
          throw new exception();
        }
        console.log(postOld.images[0]);
        console.log(postOld.images[1]);
        console.log(postOld.images[2]);
        var post = req.body;
        post.images = [];
        if (req.files.image1) {
          post.images.push(
            "/" + req.files.image1[0].path.split("\\").slice(2).join("/")
          );
          if (postOld.images[0]) deleteFiles.push(postOld.images[0]);
        } else {
          post.images.push(postOld.images[0]);
        }
        if (req.files.image2) {
          post.images.push(
            "/" + req.files.image2[0].path.split("\\").slice(2).join("/")
          );
          if (postOld.images[1]) deleteFiles.push(postOld.images[1]);
        } else {
          post.images.push(postOld.images[1]);
        }
        if (req.files.image3) {
          post.images.push(
            "/" + req.files.image3[0].path.split("\\").slice(2).join("/")
          );
          if (postOld.images[2]) deleteFiles.push(postOld.images[2]);
        } else {
          post.images.push(postOld.images[2]);
        }
        post.owner = userID;
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
      .then(function () {
        deleteFilesF(deleteFiles);
        res.redirect("/me/posted");
      })
      .catch(function (err) {
        deleteImages();
        renderError("ERROR 404", "thiếu dữ liệu đâu vào 2" + err);
      });

    function renderError(title, content) {
      res.render("post/announcePost", {
        title: title,
        content: content,
      });
    }
    function deleteFilesF(files) {
      if (files) {
        files.map((item) => {
          try {
            fs.unlinkSync("src/public" + item);
          } catch (err) {
            console.error(err);
          }
        });
      }
    }
    function deleteImages() {
      if (req.files.image1) {
        try {
          fs.unlinkSync(req.files.image1[0].path);
        } catch (err) {
          console.error(err);
        }
      }
      if (req.files.image2) {
        try {
          fs.unlinkSync(req.files.image2[0].path);
        } catch (err) {
          console.error(err);
        }
      }
      if (req.files.image3) {
        try {
          fs.unlinkSync(req.files.image3[0].path);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  // [POST] /post/detlete/:postID
  delete(req, res, next) {
    var id = req.params.postID;
    var userID = req.cookies.userID;
    Post.delete({ _id: id, owner: userID })
      .then(function () {
        res.redirect('back')
      })
  }
  // [POST] /post/restore/:postID
  restore(req, res, next) {
    var id = req.params.postID;
    var userID = req.cookies.userID;
    Post.restore({ _id: id, owner: userID })
      .then(function () {
        res.redirect('back')
      })
  }
  // [POST] /post/destroy/:postID
  destroy(req, res, next) {
    var id = req.params.postID;
    var userID = req.cookies.userID;
    Post.findOne({ _id: id, owner: userID })
      .then(function (post) {
        post.images.forEach((image) => {
          if (image) {
            try {
              fs.unlinkSync('src/public' + image);
              console.log(image)
            } catch (err) {
              console.error(err);
            }
          }
        })

        return Post.deleteOne({ _id: id, owner: userID })
      })
      .then(function () {
        res.redirect('back')
      })
  }
  // [POST]/handal-From-Action
  handalFromAction(req, res, next) {
    var userID = req.cookies.userID;

    switch (req.body.action) {
      case 'delete': {
        Post.delete({ _id: { $in: req.body.checkItems }, owner: userID })
          .then(() => {
            res.redirect('back')
          })
        break
      }
      case 'restore': {
        console.log('asdasd' + req.body.checkItems)
        Post.restore({ _id: { $in: req.body.checkItems }, owner: userID })
          .then(() => {
            res.redirect('back')
          })
        break
      }
      case 'destroy': {
        // xoa file anh truoc 
        Post.find({ _id: { $in: req.body.checkItems }, owner: userID })
          .then((posts) => {
            posts.forEach((post) => {
              post.images.forEach((image) => {
                fs.unlink('src/public/' + image, function (err) {
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
      default: {
        res.redirect('back')
      }
    }
  }
}
module.exports = new PostController();
