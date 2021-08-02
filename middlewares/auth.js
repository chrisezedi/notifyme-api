//import required modules
const User = require("../models/user");

module.exports = async function (req, res, next) {
  //retrieve token from request header
  const bearer = req.header("Authorization");
  const token = bearer.split(" ")[1];

  //throw error if token doesnt exists
  if (!token) return res.status(401).send("Unauthorised access");

  try {
    const decoded = await User.verifyToken(token);
    if(decoded.payload.type === "acc_t" ){
      //assign req.user to decoded result
      req.user = decoded.payload;
      //call next middleware
      next();
    }
  } catch (error) {
      res.status(400).send("Invalid token");      
  }
};
