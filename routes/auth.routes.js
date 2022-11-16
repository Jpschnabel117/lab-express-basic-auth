const { Router } = require("express");
const router = new Router();
const bcryptjs = require("bcryptjs");
const User = require("../models/User.model");
const { default: mongoose } = require("mongoose");
const saltRounds = 10;

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

//creating new user route
router.post("/signup", (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username and password.",
    });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(req.body.password)) {
    res.status(500).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }
  //not showing error, error is working, but not visible

  console.log(req.body);
  User.findOne({ username: req.body.username })
    .then((founduser) => {
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
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: err.message });
      } else if (err.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage:
            "Username needs to be unique. Username  is already used.",
        });
      } else {
        next(err);
      }
    });
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
  let userPwCheck = "";
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
      console.log(
        "compare result: ",
        bcryptjs.compareSync(hashedPassword, userPwCheck)
      );
      //not correct password check result
      bcryptjs.compare(hashedPassword, userPwCheck).then((validPW) => {
        console.log(validPW);
        if (validPW) {
          console.log("correct PW");
          //res.render("/userProfile", { user: req.body.user });

          req.session.currentUser = '';
          res.redirect("/userProfile");
        } else {
          res.status(500).render("auth/signin", {
            errorMessage: "incorrect password",
          });
          return;
        }
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
