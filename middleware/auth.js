const jwt = require("jsonwebtoken");
const config = require("config");
const moment = require("moment");
const { User } = require("../models/user");
const { BlacklistedToken } = require("../models/refreshToken/blacklistedToken");
const { cookieConfig } = require("../utils/refreshToken");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    res.clearCookie('x-refresh-token', cookieConfig);
    return res.status(401).send({
      success: false,
      message: "Access denied",
      error_code: 1002,
    });
  }

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    const user = await User.findById(req.user._id);
    if (!user) {
      res.clearCookie('x-refresh-token', cookieConfig);
      return res.status(400).send({
        success: false,
        message: "Invalid token.",
        error_code: 1001,
      });
    }

    next();
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') {
      // Check refresh token in cookies if access token is expired
      const refreshToken = req.cookies["x-refresh-token"];
      if (!refreshToken) {
        res.clearCookie('x-refresh-token', cookieConfig);
        return res.status(401).send({
          success: false,
          message: "Invalid refresh token.",
          error_code: 1001,
        });
      }

      // Ensure decoded refresh token is not null
      const decoded = jwt.decode(refreshToken);
      if (!decoded) {
        res.clearCookie('x-refresh-token', cookieConfig);
        return res.status(400).send({
          success: false,
          message: "Invalid refresh token.",
          error_code: 1001,
        });
      }
      
      // Ensure user id in refresh token exists
      const user = await User.findById(decoded._id);
      if (!user) {
        res.clearCookie('x-refresh-token', cookieConfig);
        return res.status(400).send({
          success: false,
          message: "Invalid refresh token.",
          error_code: 1001,
        });
      }

      // Validate refresh token and generate new pair of tokens
      try {
        jwt.verify(refreshToken, `${config.get("jwtRefreshKey")}${user.password}`);

        // Ensure refresh token has not been blacklisted
        let blacklistedToken = await BlacklistedToken.findOne({
          userRef: user._id,
          refreshToken
        });

        if (blacklistedToken) {
          // Throw error if token was blacklisted more than 2 minutes ago. This is to take into account mutliple
          // asynchronous requests hitting the server around the same time
          const now = moment();
          const blacklistedTime = moment(blacklistedToken.createdDate);
          if (now.diff(blacklistedTime) > 120000) {
            res.clearCookie('x-refresh-token', cookieConfig);
            return res.status(400).send({
              success: false,
              message: "Invalid refresh token.",
              error_code: 1001,
            });
          }
        } else {
          // Add refresh token to blacklist and autodelete it 1 minute after its expiry time
          blacklistedToken = new BlacklistedToken({
            userRef: user._id,
            refreshToken,
            expirationDate: new Date(decoded.exp * 1000 + 60000)
          });
          blacklistedToken.save().catch(err => {});
        }

        const decodedUser = jwt.decode(token);
        // const newToken = user.generateAuthToken(null, decodedUser, res);
        const newToken = user.generateAuthToken(null, res);
        res.set('x-auth-token', newToken);
        req.user = decodedUser;

        next();
      } catch (err) {
        // Revoke refresh token here
        
        res.clearCookie('x-refresh-token', cookieConfig);
        return res.status(400).send({
          success: false,
          message: "Invalid refresh token.",
          error_code: 1001,
        });
      }
    } else {
      res.clearCookie('x-refresh-token', cookieConfig);
      res.status(400).send({
        success: false,
        message: "Invalid token.",
        error_code: 1001,
      });
    }
  }
};
