const { Router } = require("express");
const router = new Router();
const bcryptjs = require("bcryptjs");
const User = require("../models/User.model");
const saltRounds = 10;

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username and password.",
    });
    return;
  }
  console.log(req.body);
  User.findOne({ username: req.body.username })
    .then((founduser) => {
      if (founduser) {
        res.send("that username exists");
        return;
      }
      return bcryptjs.genSalt(saltRounds);
    })
    .then((salt) => {
      return bcryptjs.hash(req.body.password, salt);
    })
    .then((hashedPassword) => {
      return User.create({
        username: req.body.username,
        password: hashedPassword,
      });
    })
    .then((createdUser) => {
      console.log("created user: ", createdUser);
      res.redirect("/userProfile");
    })
    .catch((err) => next(err));
});

//renders userprofile
router.get("/userProfile", (req, res) => res.render("users/user-profile"));

//renders signin
router.get("/signin", (req, res, next) => {
  res.render("auth/signin");
});

//sign in, pw checks, redirects to userprofile if correct
router.post("/signin", (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.render("auth/signin", {
      errorMessage:
        "All fields are mandatory. Please provide your username and password.",
    });
    return;
  }
  console.log(req.body);
  let userPwCheck;
  User.findOne({ username: req.body.username })
    .then((founduser) => {
      if (!founduser) {
        res.send(
          "that username does not exist, try again or create an account"
        );
        return;
      }
      userPwCheck = founduser.password;
      return bcryptjs.genSalt(saltRounds);
    })
    .then((salt) => {
      return bcryptjs.hash(req.body.password, salt);
    })
    .then((hashedPassword) => {
      console.log("tryed PW: ", hashedPassword);
      console.log("actual PW: ", userPwCheck);
      if (bcryptjs.compare(hashedPassword, userPwCheck)) {
        console.log("correct PW");
        res.redirect("/userProfile");
      } else {
        res.send("INCORRECT PW, TRY AGAIN");
        return;
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
