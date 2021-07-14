const cors = require('cors');
const express = require("express");
const app = express();

//cors config
const allowlist = ['http://localhost:4200','https://notifyme-client.herokuapp.com']
let corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
// const corsOption = {
//   origin: function (origin, callback) {

//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
//   methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
//   optionsSuccessStatus: 200
// }

if(app.get('env') == 'test'){
    app.use(cors())
}

app.use(cors(corsOptionsDelegate))

//connect to db
require("./startup/db")();

//routes
require("./startup/routes")(app);

//home route
app.get("/", (req,res)=>{
    res.status(200).json("app started successfully");
});

module.exports = app;