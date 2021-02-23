const express = require("express");

const auth = require("../routes/auth");
const refreshToken = require("../routes/refreshToken/refreshToken");

// const returns = require("../routes/returns");
const error = require("../middleware/error");
const cookieParser = require("cookie-parser");

module.exports = function (app) {
  app.use(express.json({ limit: "50mb" }));
  //Loose end on production
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", WEB_URL);
    res.header(
      "Access-Control-Allow-Methods",
      "GET,PUT,POST,DELETE,PATCH,OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-auth-token"
    );
    res.header("Access-Control-Expose-Headers", "x-auth-token");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });
  app.use(cookieParser());

  // app.use("/api/v1/users", users);
  app.use("/api/v1/auth", auth);
  // app.use("/api/v1/returns", returns);
  
  app.use("/api/v1/refresh-token", refreshToken);

  app.use(error);
};