//define packages/modules
const config = require('config');
const mongoose = require('mongoose');

//database connection string and error handling
module.exports = function(){
const db = config.get('db');
let DB = mongoose.connect(db, {useNewUrlParser:true,useUnifiedTopology:true});
    DB.then(()=>console.log(`Database connection @ ${db}`))
      .catch((error)=>console.log(error));
}