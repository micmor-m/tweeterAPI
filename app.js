const PORT = 3005;
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const cookieSession = require("cookie-session");
const saltRounds = 10;

const router = express.Router();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   cookieSession({
//     name: "session",
//     keys: ["abcd", "1234"],
//   })
// );
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// create mongoose schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

// // Create User
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/login", function (req, res) {
  res.status(200).json({ page: "Login" });
});

app.get("/register", function (req, res) {
  res.status(200).json({ page: "Register" });
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log("New User not created", err);
        res.status(500).json("Internal server error. Try again.");
      } else {
        //authenticate user
        passport.authenticate("local")(req, res, function () {
          console.log("Created User");
          res.status(200).json({ user });
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log("Login failure", err);
      res.status(403).json("Login failure");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.status(200).json({ user: req.user });
      });
    }
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({ error: "Error" });
});

const uri = `mongodb+srv://user:${process.env.USER_PW}@cluster0.btpyc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}!`);
    });
  })
  .catch((err) => {
    console.log("Error DB connection", err);
  });
