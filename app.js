const cors = require('cors');
const express = require("express");
const app = express();

//cors config
const whitelist = ['http://localhost:4200']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions))

//home route
app.get("/", (req,res)=>{
    res.status(200).json("app started successfully");
});

//export app
module.exports = app;