const path = require("path");

const express = require("express");
const authMiddleware = require("../middlewares/is_auth");
const { check } = require("express-validator");

const adminController = require("../controllers/admin");

const router = express.Router();

// /admin/add-product => GET // we are using authMiddleware here so that only authenticated user can access this route this very useful and scalable bcz the flow is basically from left to right so first authMiddleware checked then go to next middleware if authenticated
router.get("/add-product", authMiddleware, adminController.getAddProduct);

// // /admin/products => GET
router.get("/products", authMiddleware, adminController.getProducts);

// // /admin/add-product => POST
router.post(
  "/add-product",
  authMiddleware,
  [
    check("title", "Title must be alphanumeric and minimum length of 4 ")
      .isString()
      .isLength({ min: 4 })
      .trim(),

    check("price", "Price must be numeirc and float Number")
      .isNumeric()
      .isFloat(),
    check("description", "Description must have atleast 5 characters ")
      .isLength({
        min: 5,
      })
      .trim(),
  ],
  adminController.postAddProduct
);

router.get(
  "/edit-product/:productId",
  authMiddleware,
  adminController.getEditProduct
);

router.post(
  "/edit-product",
  authMiddleware,
  [
    check("title", "Title must be alphanumeric and minimum length of 4 ")
      .isString()
      .isLength({ min: 4 })
      .trim(),
    // check("imageUrl").isURL().withMessage("Please enter a valid URL"),
    check("price", "Price must be numeirc and float Number")
      .isNumeric()
      .isFloat(),
    check("description", "Description must have atleast 5 characters ")
      .isLength({
        min: 5,
      })
      .trim(),
  ],
  adminController.postEditProduct
);

router.delete(
  "/product/:productId",
  authMiddleware,
  adminController.deleteProduct
);

module.exports = router;
