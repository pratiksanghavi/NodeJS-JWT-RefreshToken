const winston = require("winston");
const express = require("express");
const app = express();
const config = require("config");

global.BASE_URL = config.get("baseUrl");
global.WEB_URL = config.get("webUrl");

require("./include/logging")();
require("./include/routes")(app);
require("./include/db")();
require("./include/config")();
require("./include/validation")();

// const port = process.env.PORT || 3000;
const port = 8080;

const server = app.listen(port, () =>{
  console.log(`server started on port ${port}...`);
  winston.info(`Listening on port ${port}...`)
}
  
);
module.exports = server;
