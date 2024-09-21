const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const User = require("./models/user");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const app = express();
const csrf = require("csurf");
const flash = require("connect-flash");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("./util/cloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// ================================Session Store Setting ===================
//by this our sessions will be stored in the databse
const store = new MongoDbStore({
  uri: "mongodb://localhost:27017/Shop",
  collection: "sessions",
});
app.set("view engine", "ejs");
app.set("views", "views");

// ===================================Cloudinary Setting After cloudinary config=====================
// =============Here using cloudinary storage for this we have to install multer-storage-cloudinary and cloudinary and i felt this is so slow so i am using anothe rway first save the uploaded file locally and then take the local file and upload it to the cloudinary and then delete the local file
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     // transformation: [{ width: 500, height: 300, crop: "limit" }],
//     folder: "images", // Optional folder name to store images in Cloudinary
//     // format: async (req, file) => "png", // supports promises as well
//     public_id: (req, file) =>
//       `${new Date().toISOString().replace(/:/g, "-")}-${file.originalname}`,
//     resource_type: "image", // Specify the resource type
//     tags: ["uploads", "user-uploads"], // Add tags
//     context: { alt: "Uploaded image", caption: "User uploaded image" }, // Add context metadata
//   },
//   limits: { fileSize: 10 * 1024 * 1024 }, // In bytes: 20 MB
// });
// ================================Multer Middleware Setting ===================
const uploadDir = path.join(__dirname, "images");
// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// ================================Multer Middleware Setting ===================
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single("image")
); //image is basically the name of the field i have defined in my form
// app.use(express.static(path.join(__dirname, "images"))); //we will make the images folder publically available so that we can access the images from the browser /images is included bcz when we add "images" in the static then we are telling express serve file from inside the images folder so when we access the image from the browser we have to write /images/imagename.jpg so that express will know that we are accessing the image from the images folder
app.use(express.static(path.join(__dirname, "public")));
// ================================Session Middleware Setting ===================

app.use(
  session({
    secret: "AnyLongString",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }) //here is the basic core things need to be set for session this is initializing session and we will also set the cookie expire time
);

const csrfProtection = csrf();
app.use(csrfProtection);
app.use(flash());

// This midleware is very imp bcz when we login with the session user then that user will not have mongoose model methods it will have just data of user so if we want that user will have that methods then we must after extracting user Data from session do store it in req.user so that now it will be user that has the data of that user session but also have the mongoose models that we have in out model session user willnot have that so this midleware is imp
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.use((req, res, next) => {
  // locals plasy a crucial role weither we are using ejs or handlebars or any other template engine it is used to pass the data to the every view view with the help of middleware not individually passing into every render function individually
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  //this is the error handler provided by the express called only when next(error) middleware is called
  console.log("Error Handler Middleware", error);
  res.redirect("/500");
});

mongoose
  .connect("mongodb://localhost:27017/Shop")
  .then((result) => {
    app.listen(3000);
    console.log("Connected to Mongo Db Local Host ");
    console.log("Website is live at  " + 3000);
  })
  .catch((err) => {
    throw new Error(err);
  });
