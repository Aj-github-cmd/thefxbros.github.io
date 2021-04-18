const Mongoose = require('mongoose')
const userSchema = new Mongoose.Schema({
    name:{
        type: String,
        required: true
        },
    email:{
        type:String,
        required: true
    },
    password:
    {
        type:String,
        required: true
    },
    date:
    {
        type:Date,
        default:Date.now


    }
});
const User = Mongoose.model('User',userSchema)
module.exports = User;