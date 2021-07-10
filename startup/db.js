//define packages/modules
const config = require('config');
const mongoose = require('mongoose');

//database connection string and error handling
module.exports = async function(){
  try {
    let options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    };
  
    const db = config.get('db');
    await mongoose.connect(db, options) && console.log(`Database connected @ ${db}`);
  } catch (error) {
    console.log(error)
  }
}