const mongoose=require('mongoose');
const Schema=mongoose.Schema
const bcrypt=require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');

var NotificationSchema = mongoose.Schema({
    receiver_id: {
        type: mongoose.Schema.Types.Number,
        ref: "User" 
    },
    body: {
        type: String 
    },
    title: {
        type: String 
    },
    timeStamp: {
        type:Date,
    	require:true
    }
});
// NotificationSchema.plugin(autoIncrement.plugin,  'Notification');
module.exports = mongoose.model('Notification', NotificationSchema);