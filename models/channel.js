//import required modules 
const mongoose = require('mongoose');
const Joi = require('joi');

//schema definition
const Schema = mongoose.Schema;

const channelSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    createdat:{
        type:Date,
        required:true
    },
    subscribers:[],
    subscriptions:[],
    category:{
        type:String,
        required:true
    },
    imgurl:{
        type:String,
        default:'https://res.cloudinary.com/dz3c3h3jx/image/upload/v1596669125/assets/images-button_mzdqp5.png'
    },
    public_id:{
        type:String,
    }
});

//model
const Channel = mongoose.model('Channel',channelSchema);
module.exports = Channel;

//validate channel input
module.exports.validateChannel = function (channel) {  
    const schema = Joi.object().keys({
        name: Joi.string().max(50).required(),
        description:Joi.string().max(400).required(),
        category:Joi.string().required()
    });
    
    //.... Return result....
    const result = Joi.validate(channel, schema);
    return result;
}


//channel categories
module.exports.channelCategories = function(){
    let categories = [
        {'isSelected':false,'name':'art'},
        {'isSelected':false,'name':'tech'},
        {'isSelected':false,'name':'sport'},
        {'isSelected':false,'name':'health'},
        {'isSelected':false,'name':'business'},
        {'isSelected':false,'name':'politics'},
        {'isSelected':false,'name':'education'},
        {'isSelected':false,'name':'entertainment'},
    ];

    return categories; 
}