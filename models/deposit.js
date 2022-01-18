const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');

var DepositorSchema = mongoose.Schema({
    deposited_amount: {
        type: String  
    },
    depositor_source: {
        type: String  
    },
    depositor_message: {
        type: String 
    },
    deposit_status: {
        type: String,
        default: 'pending',
        enum: ["pending", "confirmed", "unconfirmed"] 
    },
    depositor: {
        type: mongoose.Schema.Types.Number,
        ref: "User" 
    },
    deposited_proof: {
      type: []
    }, 
    created_at: {
        type:Date,
    	require:true
    }
});
// DepositorSchema.plugin(autoIncrement.plugin,  'Deposit');
module.exports = mongoose.model('Deposit', DepositorSchema);