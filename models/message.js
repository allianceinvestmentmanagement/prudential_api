const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');

var MessageSchema = mongoose.Schema({
    name: {
        type: String 
    },
    phone_number: {
        type: String  
    },
    email: {
        type: String  
    },
    subject: {
        type: String 
    },
    message: {
        type: String 
    },
    created_at: {
        type:Date,
    	require:true
    }
});
// MessageSchema.plugin(autoIncrement.plugin,  'Message');
module.exports = mongoose.model('Message', MessageSchema);