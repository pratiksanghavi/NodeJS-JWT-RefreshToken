const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const jwt = require("jsonwebtoken");
// const Joi = require("joi");
const Joi = require('@hapi/joi');

const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();


const moment = require("moment");
const { BlacklistedToken } = require("../models/refreshToken/blacklistedToken");
const { cookieConfig } = require("../utils/refreshToken");



router.post("/login", async (req, res) => {
  const { error } = vLogin.validate(req.body);
  if (error)
    return res
      .status(400)
      .send(successMessage(false, error.details[0].message, 201));
     
  const users = await User.find({ email: req.body.email });
  if (users.length === 0)
    return res
      .status(400)
      .send(successMessage(false, "Invalid email or password", 202));
  
  if (users.length === 1) {
    let user = users[0];
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
      return res
        .status(400)
        .send(successMessage(false, "Invalid email or password", 203));

    

    
      const token = user.generateAuthToken(null, res);
      let data = new Object();
      data.token = token;

      res.send(successMessage(true, "Login successful", null, data));
  } else {
    let correctPassword = 0;

    // Check if at least 1 password matches
    for (const user of users) {
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (validPassword) {
        correctPassword++;
        break;
      }
    }

    if (!correctPassword) {
      return res
        .status(400)
        .send(successMessage(false, "Invalid email or password", 400));
    }

  }
});
router.get("/check",auth,async (req, res) => {
    const user = await User.find()
      .select("_id name")
      .sort("name");
    
    res.send(successMessage(true, "User Data", null, user));
  }
);

// Logout and clear cookie with refresh token
router.get('/logout', async (req, res) => {
  const refreshToken = req.cookies['x-refresh-token'];

  // Add refresh token to blacklist and autodelete it 1 minute after its expiry time
  if (refreshToken) {
    const decoded = jwt.decode(refreshToken);
    if (decoded && decoded.exp > 0) {
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(404).send(successMessage(false, 'User not found.', 404));
      }

      const blacklistedToken = new BlacklistedToken({
        userRef: decoded._id,
        refreshToken,
        expirationDate: new Date(decoded.exp * 1000 + 60000)
      });
      blacklistedToken.save().catch(err => {});
    }
  }

  // Clear cookie containing refresh token
  res.clearCookie('x-refresh-token', cookieConfig);
  res.send(successMessage(true));
});

const vLogin = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
});


function validateLogin(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };
  return Joi.validate(req, schema);
}

function successMessage(success, message, error_code, data) {
  const successSchema = {
    success: success,
    message: message,
    error_code: error_code,
    data: data,
  };
  return successSchema;
}

function validateStep1(req) {
  const schema = {
    mobile: Joi.string().min(10).max(10).required(),
    // messageid: Joi.string().min(3).max(50).required(),
  };
  return Joi.validate(req, schema);
}

module.exports = router;