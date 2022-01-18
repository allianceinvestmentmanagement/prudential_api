const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');

var WalletSchema = mongoose.Schema({
    deposit_method: {
        type: String 
    },
    transaction_id: {
        type: String,
        unique: true
    },
    deposit_amount: {
        type: String  
    },
    deposit_status: {
        type: String,
        enum : ['processing','cancelled', 'success', 'Approved'],
        default: 'processing'
    },
    deposit_balance: {
        type: String 
    },
    deposit_charge: {
        type: String 
    },
    created_at: {
        type:Date,
    	require:true
    }
});
// WalletSchema.plugin(autoIncrement.plugin,  'Wallet');
module.exports = mongoose.model('Message', WalletSchema);