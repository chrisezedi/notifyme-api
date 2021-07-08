const express = require("express");
const app = express();

//home route
app.get("/", (req,res)=>{
    res.status(200).json("app started successfully");
});

//export app
module.exports = app;