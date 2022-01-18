const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');

var OwnerWalletSchema = mongoose.Schema({
    wallet_token: {
        type: String  
    },
    wallet_name: {
        type: String  
    },
    created_at: {
        type:Date,
    	require:true
    }
});
// OwnerWalletSchema.plugin(autoIncrement.plugin,  'OwnerWallet');
module.exports = mongoose.model('OwnerWallet', OwnerWalletSchema);