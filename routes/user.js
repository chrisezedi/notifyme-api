const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

//get access token
router.get("/access_token", async(req,res) => {
  try{
    if(!req.headers.cookie){
      return res.status(404).json({ msg:"no cookie present" })
    }
    const cookie = req.headers.cookie;
    const start = cookie.indexOf("=") + 1;
    const oldRefreshToken = cookie.substring(start,cookie.length);

    const decoded = await User.verifyToken(oldRefreshToken);
    
    //payload
    const { id, email, firstname } = decoded;
    const payload = { id, email, firstname };

    const token = User.generateToken(payload);

    //generate refresh token
    const refreshToken = User.generateRefreshToken(payload);
    const cookieExpiration = new Date(Date.now() + 604800000);
    res.cookie("refreshToken",refreshToken,{
      secure:(process.env.NODE_ENV !== "development" || process.env.NODE_ENV !== "test"),
      httpOnly:true,
      expires:cookieExpiration
    });
    return res.status(200).json({ success: true, token });
  } catch (error){
    console.log(error);
    return res.status(500).json({ success: false, error: error.message });

  }
});

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

    const vToken = User.generateVerificationToken(payload);

    user.password = hash;
    user.verificationcode = vToken;
  

    const response = await User.sendVerificationEmail(user);
    if ((response.success)) {
      //save user and verification code to db
      await user.save();
      res.status(200).json({ success: true });
    }
    } catch (error) {
      res.status(500).json({error});
    }
  });

//verify user
router.put("/verify", async (req, res) => {
  try {
    let decoded = await User.verifyToken(req.body.token);
    //retrieve user id from token
    const id = decoded.payload.id;

    //find user in db, if user exists, update isVerified status
    const user = await User.findByIdAndUpdate(
      { _id: id },
      { isverified: true },
      { new: true }
    );

    //generate access token
    const { _id, email, firstname } = user;
    const payload = { id:_id, email, firstname };
    const token = User.generateToken(payload);

    //generate refresh token
    const refreshToken = User.generateRefreshToken(payload);
    const cookieExpiration = new Date(Date.now() + 604800000);
    res.cookie("refreshToken",refreshToken,{
      secure:(process.env.NODE_ENV !== "development" || process.env.NODE_ENV !== "test"),
      httpOnly:true,
      expires:cookieExpiration
    });

    return res.status(200).json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

//resend verification link
router.post("/resend_verification_link", async(req,res) => {
  try {
    //check if email exist, if not send error else send email
    let user = await User.findOne({email:req.body.email});
    if (!user) return res.status(400).json({user, msg:"User does not exist!"});

    //gen token
    const { _id, email, firstname } = user;
    const payload = { id:_id, email, firstname }

    const vToken = User.generateVerificationToken(payload);

    user.verificationcode = vToken;

    const response = await User.sendVerificationEmail(user);
    if ((response.success)) {
      res.status(200).json({ success: true, msg:"email sent" });
    }    
  } catch (error){
      res.status(500).json({error});
  }

});

//login
router.post("/login", async (req, res) => {
  try {
    //retrieve email and password
    const email = req.body.email;
    const password = req.body.password;

    //check if user exists
    const user = await User.findOne({ email: email });


    if (!user) {
      return res.status(404).send("User not found");
    } else {
      //verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res.status(400).send("Password incorrect");

      if (!user.isverified) {
        console.log(user)
        return res.status(400).json({ isverified:false });
      }

      //gen token
      const { _id, email, firstname } = user;
      const payload = { id:_id, email, firstname }

      //generate token and send with res
      const token = User.generateToken(payload);

      return res.status(200).json({ success: true, token });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//export router
module.exports = router;