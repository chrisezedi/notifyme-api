//required packages/modules
require("dotenv").config();
const Email = require('email-templates');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Joi = require("joi");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

//user schema
const userSchema = new schema({
  firstname: {
    type: String,
    required: true,
    maxlength: 50,
  },
  lastname: {
    type: String,
    required: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
  },
  imgurl: {
    type: String,
    default:
      "https://res.cloudinary.com/dz3c3h3jx/image/upload/v1596669125/assets/ic_person_outline_black_48dp_nfimoe.png",
  },
  public_id: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  occupation: {
    type: String,
    required: true,
  },
  verificationcode: String,
  isverified: {
    type: Boolean,
  },
  subscriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
  ],
});

//user model
const User = mongoose.model("User", userSchema);
module.exports = User;

//validate user input
module.exports.validateUser = function (user) {
  const schema = Joi.object().keys({
    firstname: Joi.string().max(50).required(),
    lastname: Joi.string().max(50).required(),
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().min(8).required(),
    occupation: Joi.string().required(),
  });

  //.... Return result....
  const result = Joi.validate(user, schema);
  return result;
};

module.exports.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};
    
// generate verification token
module.exports.generateVerificationToken = function (payload) {
  let privateKey = process.env.PRIVATE_ACCESS_TOKEN_SECRET.replace(/\\n/g, '\n')
  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "24h",
  });
  return token;
};

// generate Access token
module.exports.generateToken = function (payload) {
  const newPayload = {...payload, type:'acc_t'};
  let privateKey = process.env.PRIVATE_ACCESS_TOKEN_SECRET.replace(/\\n/g, '\n')
  const token = jwt.sign(newPayload, privateKey, {
    algorithm: "RS256",
    expiresIn: "5m",
  });
  return token;
};

// generate Access token
module.exports.generateRefreshToken = function (payload) {
  const newPayload = {...payload, type:'ref_t'};
  let privateKey = process.env.PRIVATE_ACCESS_TOKEN_SECRET.replace(/\\n/g, '\n')
  const token = jwt.sign(newPayload, privateKey, {
    algorithm: "RS256",
    expiresIn: "3d",
  });
  return token;
};

//verify token 
module.exports.verifyToken = async function (token) {
 //verify verification code
 let publicKey = process.env.PUBLIC_ACCESS_TOKEN_SECRET.replace(/\\n/g, '\n')
 let decodedToken = jwt.verify(token,publicKey,{ algorithms: "RS256",complete: true});
 return decodedToken;
}

//send verification email
module.exports.sendVerificationEmail = async function (user) {
  //initialise google oauth
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL
  );

  //nodemailer config
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_CLIENT_EMAIL,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: process.env.GMAIL_ACCESS_TOKEN,
    expires: Number.parseInt(process.env.GMAIL_TOKEN_EXPIRE, 10),
  },
});

  return new Promise(function (resolve,reject){
    const email = new Email({
      message: {
        from: process.env.GMAIL_CLIENT_EMAIL
      },
      // uncomment below to send emails in development/test env:
      send: true,
      preview:false,
      transport: transporter
    });
  
    email
      .send({
        template: 'verify',
        message: {
          to: user.email
        },
        locals: {
          name: user.firstname,
          baseUrl:process.env.CLIENT_BASE_URL,
          vCode:user.verificationcode
  
        }
      })
      .then(()=>{
        resolve({success:true})
      })
      .catch((error)=>{
        reject({success:false,error})
      });
  })
  };
