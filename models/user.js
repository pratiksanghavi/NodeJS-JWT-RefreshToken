const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const { generateRefreshToken } = require("../utils/refreshToken");
const authTokenExpiry = '30s';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    lowercase: true,
    unique: false
  },
  mobile: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    unique: false
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  }
});


userSchema.methods.generateAuthToken = function (expiresIn, res) {
  let params = {
    _id: this._id,
    name: this.name
  };
  const token = jwt.sign(
    params,
    config.get("jwtPrivateKey"),
    { expiresIn: authTokenExpiry }
  );
  generateRefreshToken(this._id, this.password, res);
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    mobile: Joi.string().min(10).max(10).required(),
    password: Joi.string().min(5).max(255).required(),
  };
  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;