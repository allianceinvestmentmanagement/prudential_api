const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');

var WithdrawSchema = mongoose.Schema({
    withdraw_method: {
        type: String 
    },
    amount: {
        type: String
    },
    token: {
        type: String
    },
    withdraw_status: {
        type: String,
        default: 'processing',
        enum : ['processing', 'approve', 'unapproved']
    },
    owner: {
        type: mongoose.Schema.Types.Number,
        ref: "User" 
    },
    created_at: {
        type:Date,
    	require:true
    }
});
// WithdrawSchema .plugin(autoIncrement.plugin,  'Withdraw');
module.exports = mongoose.model('Withdraw', WithdrawSchema );