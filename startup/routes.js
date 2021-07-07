//define packages/modules
const express = require('express');
const users = require('../routes/user');


//route middlewares
module.exports = function (app) {
    app.use(express.json());
    app.use('/api/users', users);
}