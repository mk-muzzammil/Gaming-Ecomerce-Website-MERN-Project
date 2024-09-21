const { trusted } = require("mongoose");
const product = require("../models/product");
const Product = require("../models/product");
const flash = require("connect-flash");
const { validationResult } = require("express-validator");
const path = require("path");
const cloudinary = require("../util/cloudinaryConfig");
const fs = require("fs");
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    product: {
      title: "",
      imageUrl: "",
      price: "",
      description: "",
    },
    validationErrors: [],
    errorMessage: null,
    hasError: false,
    // isAuthenticated: req.session.isLoggedIn, //no need to pass it individually bcz we have set it in the middleware so it will be available in every view with the help of locals
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  // const imageUrl = req.body.imageUrl; //for text data
  const image = req.file; //for dile data using multer
  const price = req.body.price;
  const description = req.body.description;
  console.log("Result of multer image path", image);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: [],
      errorMessage: "Attached file is not an image of type jpg,jpeg or png",
      hasError: true,
      // isAuthenticated: req.session.isLoggedIn, //no need to pass it individually bcz we have set it in the middleware so it will be available in every view with the help of locals
    });
  }

  // imageUrl = path.join("/images", image.filename);
  // imageUrl = image.path; //when using cloudinary

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      product: {
        title: title,
        imageUrl: image.path,
        price: price,
        description: description,
      },
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
      hasError: true,
      // isAuthenticated: req.session.isLoggedIn, //no need to pass it individually bcz we have set it in the middleware so it will be available in every view with the help of locals
    });
  }
  cloudinary.uploader
    .upload(image.path, { folder: "images" })
    .then((result) => {
      const imageUrl = result.secure_url;
      const productPublicId = result.public_id; // Get public_id from Cloudinary

      fs.unlinkSync(image.path); // Delete local file after upload

      const product = new Product({
        title,
        price,
        description,
        imageUrl,
        imagePublicId: productPublicId, // Save the public_id
        userId: req.user._id,
      });

      return product.save();
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error("Adding product failed", err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)
    .then((product) => {
      if (!product || product.userId.toString() !== req.user._id.toString()) {
        //here is we dotn want to allow the user to edit the product that is not created by him so we are checking the user id of the product and the user id of the logged in user
        req.flash("error", "You are not authorized to edit this product");

        return res.redirect("/admin/products");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],

        // isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error("Get Editing product Page failed", err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
      hasError: true,
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/admin/products");
      }

      product.title = updatedTitle;
      product.price = updatedPrice;

      if (image) {
        return cloudinary.uploader
          .upload(image.path, { folder: "images" })
          .then((result) => {
            product.imageUrl = result.secure_url;

            // Delete local file
            fs.unlinkSync(image.path);

            product.description = updatedDesc;
            return product.save();
          });
      } else {
        product.description = updatedDesc;
        return product.save();
      }
    })
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error("Editing product failed", err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  // .find() method is the mongoose provided model method that is used to fetch all the data from the database  for now it is oka but for large amount of data we will apply pagination with the help of cursor() and next () method we will handle it
  let errorMessage = req.flash("error");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        errorMessage: errorMessage,
        // isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error("Loading Products Failed", err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findOne({ _id: prodId, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const imagePublicId = product.imagePublicId;
      console.log("Image Public Id ", imagePublicId);

      // Delete the image from Cloudinary
      return cloudinary.uploader.destroy(imagePublicId).then(() => {
        // After deleting the image, delete the product from the database
        return Product.deleteOne({ _id: prodId, userId: req.user._id });
      });
    })
    .then(() => {
      console.log("Deleted product and image from Cloudinary");
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed" });
    });
};
