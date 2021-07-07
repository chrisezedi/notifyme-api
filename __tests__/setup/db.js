const mongoose = require("mongoose");
const config  = require("config");

let options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  };

  //connect to test db
  module.exports.connectToTestDb = async () => {
      const db = config.get('db');
      await mongoose.connect(db, options);
  }


  //close mongoose connection
  module.exports.closeTestDbConnection = async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
  }

  //clear database
  module.exports.clearTestDb = async () => {
      const collections = mongoose.connection.collections;
      for (const key in collections){
          const collection = collections[key];
          await collection.deleteMany();
      }
  } 