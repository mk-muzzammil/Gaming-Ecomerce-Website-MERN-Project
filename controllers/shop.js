const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ITEMS_PER_PAGE = 6;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;

  let totalItems;
  Product.find() // .find() gives us the whole array in response
    // fetching product based on the user id can be done easily by using the populate method in mongoose
    // and we can also use the select method to select the fields that we want to fetch from the database whole object using refrence that will be more secure but it breaks our application so we will not use it for now
    // .select("title price -_id")
    // .populate("userId", "username")
    .countDocuments()
    .then((productNum) => {
      totalItems = productNum;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE); // .find() gives us the whole array in response limit will limit the amount of products
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        // isAuthenticated: req.session.isLoggedIn,
        currentPage: page,
        previousPage: page - 1,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error("Get Shop Products Page failed", err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  // ====================findById() method is the mongoose provided model method that is used to fetch the data from the database based on the id of the document and it also handles the conversion of String into Object Id =====================
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        // isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;

  let totalItems;
  Product.find()
    .countDocuments()
    .then((productNum) => {
      totalItems = productNum;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE); // .find() gives us the whole array in response limit will limit the amount of products
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        // isAuthenticated: req.session.isLoggedIn,
        currentPage: page,
        previousPage: page - 1,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};
// exports.getCheckout = (req, res, next) => {
//   req.user
//     .populate("cart.items.productId")
//     .then((user) => {
//       const products = user.cart.items.filter((item) => item.productId); // Filtering out null products
//       let total = 0;
//       products.forEach((prod) => {
//         if (prod.productId) {
//           // Check if productId is not null
//           total += prod.quantity * prod.productId.price;
//         }
//       });
//       res.render("shop/checkout", {
//         path: "/checkout",
//         pageTitle: "Checkout",
//         products: products,
//         totalSum: total,
//         // isAuthenticated: req.session.isLoggedIn,
//       });
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };
exports.getCart = (req, res, next) => {
  // to implement this fucntionalityh of getCart() we will use 2 approaches onw is define method in userSchema which will return the cart items and the other approach is to use the populate method in mongoose to fetch the cart items from the database easily just bcz of the refrence in the schema of the cart items populate method will fetch the cart items and it will  retun promise  we will not use the execPopulate() method
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const cartItems = user.cart.items.filter((item) => item.productId); //to filter out the null products
      console.log("Get Cart Method", cartItems);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartItems,
        // isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items
        .filter((item) => item.productId) // Filter out any null productId
        .map((item) => {
          return {
            quantity: item.quantity,
            product: { ...item.productId._doc },
          };
        });

      const order = new Order({
        products: products,
        user: {
          email: req.user.email,
          userId: req.user,
        },
      });
      order.save();
    })
    .then((result) => {
      // aftter the order we want to clear the cart of products one way is to define a method into user.js which clear the cart is easy
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id }) //here we will get orders related to that user by userId which is nested in user so user.userId is basically reflecting  our user Model and right side we are matching it with curent userId if matches it will show the orders
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        // isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.getInvoices = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("Order Not Found"));
      } else {
        if (order.user.userId.toString() !== req.user._id.toString()) {
          return next(new Error("Unauthorized Access Prohibited"));
        }
        const pdfDoc = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'inline; filename="' + invoiceName + '"'
        );
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        // Header
        pdfDoc.fontSize(20).text("My Shop", { align: "center" }).moveDown(0.5);

        pdfDoc
          .fontSize(12)
          .text("123 Main Street", { align: "center" })
          .text("Anytown, USA 12345", { align: "center" })
          .moveDown();

        pdfDoc
          .fontSize(26)
          .text("Invoice", { align: "center", underline: true })
          .moveDown();

        // Customer Details
        pdfDoc.fontSize(14).text(`Order ID: ${orderId}`, { align: "right" });

        // Table Headers
        pdfDoc.fontSize(14).text("Products", { underline: true }).moveDown(0.5);

        // Table Rows
        let total = 0;
        const tableTop = 260;
        const itemDetailsTop = 330;
        let i = 0;
        order.products.forEach((prod, index) => {
          total += prod.quantity * prod.product.price;
          pdfDoc
            .fontSize(12)
            .text(
              `${prod.product.title} - Quantity: ${prod.quantity} x $${prod.product.price}`,
              50,
              tableTop + (index + 1) * 30
            );
        });

        pdfDoc
          .fontSize(16)
          .text(`Total Price: $${total}`, { align: "right" })
          .moveDown();

        // Footer
        pdfDoc.text("Thank you for your purchase!", {
          align: "center",
          underline: true,
        });

        pdfDoc.end();

        // ============this is the way to read the pdf simply and send the content to the browser by setting headers==============
        // fs.readFile(invoicePath, (err, data) => {
        //   if (err) {
        //     return next(err);
        //   } else {
        //     res.setHeader("Content-Type", "application/pdf");
        //     res.setHeader(
        //       "Content-Disposition",
        //       'inline; filename="' + invoiceName + '"'
        //     );
        //     console.log(data);
        //     return res.send(data);
        //   }
        // });
        //==================way to create a readstream to read the file and then pipe it to the writeable stream================
        // const fileStream = fs.createReadStream(invoicePath);
        // res.setHeader("Content-Type", "application/pdf");
        // res.setHeader(
        //   "Content-Disposition",
        //   'inline; filename="' + invoiceName + '"'
        // );
        // fileStream.pipe(res); //res is writeable stream we will pipe the readstream to writeable stream and not every object iswriteable stream but res is writeable stream
      }
    })
    .catch((err) => next(new Error(err)));
};
