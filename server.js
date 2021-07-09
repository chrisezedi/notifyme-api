const app = require('./app');
const PORT = process.env.PORT || 5000;

//listen to server
app.listen(PORT, () => console.log(`App runnin on PORT ${PORT}....`));