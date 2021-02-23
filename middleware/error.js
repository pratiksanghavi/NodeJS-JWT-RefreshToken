const winston = require('winston');
const multer = require('multer');
const { successMessage } = require('../utils/successMessage');

module.exports = function(err, req, res, next){
  winston.error(err.message, err);

  // error
  // warn
  // info
  // verbose
  // debug 
  // silly

  // Handle error due to unexpected file type for school kyc documents
  if (err instanceof multer.MulterError && err.message === 'Unexpected field') {
    return res
      .status(400)
      .send(successMessage(false, 'Unexpected file type found in request.', 400));
  }

  if (err.message && err.message.includes("Invalid regular expression")) {
    return res
      .status(400)
      .send(successMessage(false, 'Please enter a valid Name.', 400));
  }

  res.status(500).send('Something failed.');
}