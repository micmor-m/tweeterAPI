const PORT = 3005;
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const saltRounds = 10;

const router = express.Router();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["abcd", "1234"],
  })
);

// create mongoose schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// // Create User
const User = new mongoose.model("User", userSchema);

app.get("/login", function (req, res) {
  res.status(200).json({ page: "Login" });
});

app.get("/register", function (req, res) {
  res.status(200).json({ page: "Register" });
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
