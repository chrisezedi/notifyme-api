const cors = require('cors');
const app = require('./app');
const PORT = process.env.PORT || 3000;

//cors config
const whitelist = ['http://localhost:4200']
const corsOption = {
  origin: function (origin, callback) {
      console.log(origin)

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

if(app.get('env') == 'development'){
    app.use(cors(corsOption));
}

//listen to server
app.listen(PORT, () => console.log(`App runnin on PORT ${PORT}....`));