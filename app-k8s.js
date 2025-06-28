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

// Get MongoDB connection string from environment variables or default to local service
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongodb-service:27017/shop";

// ================================Session Store Setting ===================
//by this our sessions will be stored in the databse
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

// ================================Multer Middleware Setting ===================
const uploadDir = path.join(__dirname, "images");
// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
);

app.use(express.static(path.join(__dirname, "public")));

// ================================Session Middleware Setting ===================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "AnyLongString",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

const csrfProtection = csrf();
app.use(csrfProtection);
app.use(flash());

// This midleware is very imp bcz when we login with the session user then that user will not have mongoose model methods
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
  console.log("Error Handler Middleware", error);
  res.redirect("/500");
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(PORT);
    console.log("Connected to MongoDB at:", MONGODB_URI);
    console.log("Website is live at port:", PORT);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
