const session = require("express-session");
// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");
//const bcrypt = require("becryptjs");

const app = express();
const MongoStore = require("connect-mongo");

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require("./config")(app);

// default value for title local
const projectName = "lab-express-basic-auth";
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}- Generated with Ironlauncher`;

app.use(
  session({
    secret: "keyboardcat",
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      secure: false,
      httpOnly: true,
      maxAge: 60000 * 2, // 60 * 1000 ms === 1 min
    },
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || "mongodb://localhost/lab-express-basic-auth",
    }),
  })
);


// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const authRouter = require("./routes/auth.routes");
app.use("/", authRouter);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
