
module.exports = (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);  
    if (error) return res.status(400).send({
        success: false,
        message: error.details[0].message,
        error_code: 1004,
    });
    next();
  }
}
