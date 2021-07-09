const express = require("express");
const router = express.Router();
const User = require("../models/user")

//register route
router.post("/", async (req, res) => {
  
  try {

    //validate data
    const result = User.validateUser(req.body);
    
    if (result.error){
      return res.status(400).json({ error: result.error.details[0].message });  
    }

    //check if user already exists
    let userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ msg: "This email address is unavailable" });
    }

    const user = new User(req.body);

    //gen salt and hash password
    const hash = await User.hashPassword(user.password);

    //gen token
    const { _id, email, firstname } = user;
    const payload = { id:_id, email, firstname }

    const vToken = User.generateToken(payload);

    user.password = hash;
    user.verificationcode = vToken;
  

    const response = await User.sendVerificationEmail(user);
    if ((response.success)) {
      //save user and verification code to db
      await user.save();
      res.status(200).json({ success: true });
    }
    } catch (error) {
      console.log(error)
      res.status(500).json({error:"Server error"});
    }
  });

//verify user
router.put("/:vtoken", async (req, res) => {
  try {
    const token = User.verifyToken(req.params.vtoken);

    //retrieve user id from token
    const id = token.payload._id;

    //find user in db, if user exists, update isVerified status
    const user = await User.findByIdAndUpdate(
      { _id: id },
      { isverified: true },
      { new: true }
    );

    //generate token and send with response
    const payload = User.pickPayloadProps(user);
    token = User.generateToken(payload);

    return res.status(200).json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

//export router
module.exports = router;