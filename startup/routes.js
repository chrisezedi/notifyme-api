//define packages/modules
const express = require('express');
const users = require('../routes/user');
const channels = require('../routes/channel');

//route middlewares
module.exports = function (app) {
    app.use(express.json());
    app.use('/api/users', users);
    app.use('/api/channels', channels);
}