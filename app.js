const cors = require('cors');
const express = require("express");
const app = express();

//cors config
const whitelist = ['http://localhost:4200','https://notifyme-client.herokuapp.com']
const corsOption = {
  origin: function (origin, callback) {

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
}

if(app.get('env') == 'test'){
    app.options('*', cors())
}

app.use(cors(corsOption))
app.options('*', cors(corsOption))

//connect to db
require("./startup/db")();

//routes
require("./startup/routes")(app);

//home route
app.get("/", (req,res)=>{
    res.status(200).json("app started successfully");
});

module.exports = app;