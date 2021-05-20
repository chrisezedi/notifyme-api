const express = require("express");
const app = express();

//required middlewares
require("./startup/db")();

//listen to server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`App runnin on PORT ${port}....`));
module.exports = server;