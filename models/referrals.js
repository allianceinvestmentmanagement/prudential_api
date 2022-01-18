const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');

var ReferralSchema = mongoose.Schema({
    referral_code: {
        type: String,
        unique: true
    },
    userid: {
        type: mongoose.Schema.Types.Number,
        ref: "User" 
    },
    created_at: {
        type:Date,
    	require:true
    }
});
// ReferralSchema.plugin(autoIncrement.plugin,  'Referral');
module.exports = mongoose.model('Referral', ReferralSchema);