const mongoose = require("mongoose");

module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send({
      success: false,
      message: "Invalid ID.",
      error_code: 1003,
    });

  next();
};
