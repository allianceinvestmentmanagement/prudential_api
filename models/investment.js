const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');

var InvestmentSchema = mongoose.Schema({
   amount: {
        type: String  
    },
     roi_date: {
        type: String  
    },
    selected_package: {
        type: String    
    },
    investor: {
        type: mongoose.Schema.Types.Number,
        ref: "User" 
    },
    invest_profit: {
        type: Number,
    },
    investment_status: {
        type: String,
        default: 'Processing',
        enum: [ "Processing", "Complete"]
    },
    created_at: {
        type:Date,
    	require:true
    }
});
// InvestmentSchema.plugin(autoIncrement.plugin,  'Invest');
module.exports = mongoose.model('Invest', InvestmentSchema);