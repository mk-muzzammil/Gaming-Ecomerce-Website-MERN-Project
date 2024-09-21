// NOte===============> Session Save Issue: Sometimes, the session changes might not be saved before the response is sent. To ensure the session is saved, use req.session.save before redirecting.
// bcrypt JS is used in such a case to excrypt the password entered so not hsown in out mongoDb
// crypto is inbuilt package in nodejs which is used to generate random token for reset password for this we use randomBytes method of crypto package for generating a buffre
//Sumarizing the procedure of resetting the password is that we will first generate a new token by crypto package and then we will store this token and also expiration date in our database into our user model because it is related to that user this is basically into post reset route and then we will send an email to the user with the link of reset password and then when user will click on that link we will take the token from the url and then we will check weither this token is valid or not and also we will check the expiration date of the token and then we will render the new password page there we will again validate by getting userId,token,expirationDate and then we will take the new password hash it by bcrypt and then we will update the password of the user and then we will redirect to the login page
//What is Authorization: Authorization is basically restricting unauthorized users from accessing the resources of the server and only authorized users can access the resources of the server eg not every authenticated user can edit or del the product if they haven't created it so for this we will use authorization Authorization will be applied on Admin controller actions like edit ,delete etc
//=======================Valiation=================
//now i am taking about validation which is for every user that comes on web and we want that they will enter valid data so we will do 3 types of validation 1)Client Side Validation 2)Server Side Validation 3)Database Validation client side validation is not so secure bcz user can change the req and send the bad req to server which is not good and so server side validation is very imp and crucial step bcz user cant acces backend code so we will validate the data on server side and then we will store the data in database so that we will not store the bad data in database so we will use express-validator package for this and for this we will add validation checks on routes by adding middlewares so they will check targeted field in query param,headers or in the cokkies every where and then we will check the validation errors and then we will send the response to the user and then we will store the data in database
//=========>we can also write the css classes according to the errors occuring to enhance user experience for that return errors.array() in the view so that we will utilize it in the view
//=========>Sanatizing user input is also imp it is like email pass will be stired in correct format no whitespaces or capitalize email also not correct so sanitization is also imp etc
//==================>Now we will talk about three types of errors that should be handled in our web app to run it properly :Network error(Mongo db server is off etc),Logical Error(Our mistake in development ) , Expected Erros(Reading files,Validation Errors etc) this can be handled by showing user a error page so they cant continue for Network errors etc and also can show messages on screen like validation errors
// ==============Multer ==> As we see when we submit form we are using urlencoded data which i include by middleware bodyparser.urlencoded this will nly accepts the text data from the from but if we want to submit mixed data imaes,files,,text we will use another third party package multer which is used to parse the form data and also we can set the file size, file type etc in the multer package very easily after it go to out from and change the encryption scheme to mixed not only urlencoded for this  add enctype="multipart/form-data" in the form tag after it we will set the middleware of multure so that it will parse the form data and then we will use it in the controller to store the file in the server and also we can set dest as images so that it will store the file in the images folder in the root directory of the project /or we will also set a storage engine given by multer so that we can set the file name and also the path of the file and also the file type etc
// ===========>How Storing files in db for this we will store the path of the file in the database not the whole file bcz its to long and also not good for performance so we will store the path of the file in the database and then we will use that path to access the file from the server so use the path we will set by our in storage engine
//=======> Magic of using these two headers res.send(data) res.setHeader("Content-Type", "application/pdf"); res.setHeader("Content-Disposition",'inline; filename="' + invoiceName + '"'); is very amazing first res.send is given by expres js allows us to send the data to the client and then Content-type setting allows to open and display the pdf in browser like pdf and then next header allows us the file name and also the inline allows us to open the file in the browser not to download it,attachment is used to download the file directly on clicking in place of inline
// ====>Reading Larger odf files : Reading whole larger pdf files and first store it in memory  is not a good way of reading files the one way is creating streams so that larger pdfs will be readed in chunks and then we will send the chunks to the client so that it will not be stored in memory and also it will be faster so for this we will use fs.createReadStream() method of fs package and then we will pipe the data to the response object so that it will be sent to the client in chunks and also it will be faster and also it will not be stored in memory implemenetd in shop contoller iin invoice
//===========> pdfkit is used to make a pdf in real time which is used then to send user a response as pdf in it it is bit hard to undertsand but it is used to make pdf in real time and then send it to the user as a response so that user can download it or view it in the browser so lets do this in shopjs

//======================Now we wil talk about pagination it is basically used to show the data in chunks not all at once so that it will be faster and also it will be good for user experience so for this we will use skip and limit methods of mongoose so that we will skip the data and then limit the data so that it will be shown in chunks so for this we will use query params in the url so that we will get the page no from the url it is basically when we have 100 od products we will not have to load all of them we will distibute and limit it into different pages
//=======>ASYNC REQ HANDLING is done after it this is optimization basically Eg when we want to del a product for now we are returning a new page in response or redirecting to new routr whoich will return a new page in response but i dontwant this reload to hapen i want to send data in response just to make sure we want to del this product and dont want to redirect to new page but the same page must be rendered without that product for this we will make changes by adding a new route in the controller which will return a json response and then we will make changes in the frontend js file so that it will send a async req to the server and then we will make changes in the controller so that it will return a json response and then we will make changes in the frontend js file so that it will render the page without reloading it so that it will be faster and also it will be good for user experience so lets do this and delete route in the routes dont have the req body so we will use req.params to get the id of the product to be deleted
//After this we will talk about Stripe.js whic is used to add payment methods on our web page its very imp and this third party package will manage payments for us 
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");
// const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

// =====================we can use anyother email service for this we are using an thirs party package for send email for which we will first make a transporter which tells how we will send our email and for it insert sendgrid transportpackage as a function which will return configuration which is needed for nodemailer to send email and then we will use this transporter to send email by using sendMail method of nodemailer
// const transporter=nodemailer.createTransport(sendgridTransport({
//   auth:{
//     api_key:"Your apiKey here",
//   }
// }));
// ==========================Simple Gmail Service Used============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "muzzammil123456@gmail.com",
    pass: "7816668640",
  },
});

exports.getSignUpPage = (req, res, next) => {
  let errorMessage = req.flash("error");
  console.log(errorMessage);
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign-Up Page",
    isAuthenticated: false,
    errorMessage: errorMessage,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
    // csrfToken: req.csrfToken(),
  });
};
exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign-Up Page",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
      // csrfToken: req.csrfToken(),
    });
  }
  // Check weither this user already exists

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      }); //here we are creating the user object and then saving it to the database
      return user.save();
    })
    .then((response) => {
      res.redirect("/login");
      // return transporter.sendMail(
      //   {
      //     to: email,
      //     from: "m.muzzammil123456@gmail.com",
      //     subject: "Signup Success",
      //     html: "<h1>You have successfully signed up</h1>",
      //   },
      //   (err, info) => {
      //     if (err) {
      //       console.log(err);
      //     } else {
      //       console.log("Email Sent ", info.response);
      //     }
      //   }
      // );
    })
    .catch((err) => {
      const error = new Error("Signup Issue", err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

exports.getLoginPage = (req, res, next) => {
  // const isLogedIn = req.get("Cookie").split(";")[4].split("=")[1]; //this is the way to acces the islogedIn cookie for visualization go to network in developer tols and see the cookie header how many cookies are present and then acces ours by this way
  // =================================Session From memory=============================
  const isLoggedIn = req.session.isLoggedIn; //here how we can acess the value of our key and kept one thing in mind for session only user that will have correct id can only have acess to it either in new browser we wil get undefined value for this and this value is shared across every req of that user not other ones
  let message = req.flash("error"); //it will return an array if there is any message in the flash other wise an empty array so not undefine so we must handle it seperately

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login Page",
    errorMessage: message,
    oldInput: { email: "", password: "" },
    validationErrors: [],
    // isAuthenticated: isLoggedIn,
    // csrfToken: req.csrfToken(),
  });
};
exports.postLogin = (req, res, next) => {
  // req.isLogedIn = true; //here what we are doing we are setting the loggedIn as true bcz now user is logged in but kept one thing in mind that after the res this req is dead and not accessible anywhere so for this we will use cookies and sessions so that authnticated user will be logged in this will be designed this way so that other users which is not authenticated should not be able to involve in req of other user there will be 100 of users and req of each user will not be related to each other so after req res will be send then the req will be served so dead now new req will be done so when we sue cookies we will authenticate the user and that user will be loggedIn so other user will not interfere to there requests so we will set the cookie and then as we know cookies is stored in browser and for evry requests the cookie wil be sent along other data in the req headers
  //========= imp Note Cookie usage has a flaw that any user can change our cookie value from developers tool which is not a good thing so in this case it is not good to use cookie in this scnerio bcz its sensitive so for this use session not cookie
  // We can set diff cookies like secure(cookie only set for https secure ) ,HttpOnly,Max-Age(by which we set the time of expiring of cookie) wil help from crossSite scripting attacks bcz cookies will not accesed by client side javascript  ,We can also set Domain to which cookie will be sent

  // ============================Sessions ================
  // Cookies ares tored on client side and session in server side by sessions we will kep our sensitive dtaa in server side so that by browser it will not be acessed and it is like stored in memory or in database and also user has to tell to which session he belongs so in this case we will store the id of session in the cookie which is encrypted one and cant be acessed bcz of encryption by unauthorized user  Lets initialize session in app.js file first install express-session package
  // res.setHeader("Set-Cookie", "isLogedIn=true"); //Cookie
  //this is the way of passing credentials to session on server side and will be stored in memory but this is not oka for large no of users so for better performance store it in mongodb install connect-mongodb-session
  // User.findById("668cfc657e6b828643708e12")
  //   .then((user) => {
  //     req.session.user = user; //this user object is mongoose object so have all the methods of mongoose models
  //     req.session.isLoggedIn = true;
  //     req.session.save((err) => {
  //       //it is useful to use this save() method here
  //       if (err) console.log(err);
  //       console.log(req.session);

  //       res.redirect("/");
  //     });
  //   })
  //   .catch((err) => console.log(err));

  //==============================Authentication =====================
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login Page",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
      // isAuthenticated: isLoggedIn,
      // csrfToken: req.csrfToken(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // req.flash("error", "Email or password invalid ");
        // return res.redirect("/login");
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login Page",
          errorMessage: "Invalid Email or password",
          oldInput: { email: email, password: password },
          validationErrors: errors.array(),
          // isAuthenticated: isLoggedIn,
          // csrfToken: req.csrfToken(),
        });
      }
      bcrypt.compare(password, user.password).then((isValid) => {
        if (isValid) {
          req.session.user = user; //this user object is mongoose object so have all the methods of mongoose models
          req.session.isLoggedIn = true;
          return req.session.save((err) => {
            //it is useful to use this save() method here
            if (err) console.log(err);

            res.redirect("/");
          });
        }
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login Page",
          errorMessage: "Invalid Email or password",
          oldInput: { email: email, password: password },
          validationErrors: errors.array(),
          // isAuthenticated: isLoggedIn,
          // csrfToken: req.csrfToken(),
        });
      });
    })
    .catch((err) => {
      const error = new Error("Login Issue", err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};

// ========================Now basically when we logout the session must be deleted because now session must not be there user will logout from system so lets do this by the function provided by the session.

exports.postLogOut = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }

    res.redirect("/");
  });
};

// =============================================Reset Passowrd Procedure================================

exports.getResetPage = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Page",
    errorMessage: message,
    // isAuthenticated: isLoggedIn,
    // csrfToken: req.csrfToken(),
  });
};
exports.postReset = (req, res, next) => {
  let email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    } else {
      let token = buffer.toString("hex"); //this is the way to convert buffer to string hex is imp bcz this buffer will be in hex
      console.log("Token Generated ", token);
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            req.flash("error", "No account with that email found");
            return res.redirect("/reset");
          } else {
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
          }
        })
        .then((response) => {
          res.redirect("/");
          // transporter.sendMail({
          //   to: email,
          //   from: "m.muzzammil123456@gmail.com",
          //   subject: "Reset Passowrd",
          //   html: `<p>You have requested for reset passowrd Click this link to proceed: </p>
          //   <p> <a href="http://localhost:3000/reset/${token}"></a> to set a new password </p>`,
          // });
        })
        .catch((err) => {
          const error = new Error("Reset failed", err);
          error.httpStatusCode = 500;
          return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
        });
    }
  });
};
exports.getNewPassword = (req, res, next) => {
  let token = req.params.token; //take token from the Url for firther validation

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Change-Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error("Get New password failed", err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};
exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error("Post new Password failed", err);
      error.httpStatusCode = 500;
      return next(error); //it will call special middleware with 4 arguments that is given y express js used to handle errors
    });
};
