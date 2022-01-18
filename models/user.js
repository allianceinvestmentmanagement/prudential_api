const mongoose=require('mongoose');
const Schema=mongoose.Schema
const bcrypt=require('bcryptjs');
const autoIncrement = require('mongoose-auto-increment');
const crypto = require('crypto');
var UserSchema=mongoose.Schema({
    name:{
    	type:String,
        require:true,
        trim: true, 
    }, 
    username:{
    	type:String,
        require:true,
        trim: true, 
    },
    referral_code:{
        type:String,
    },
    phone_number:{
    	type:Number,
        require:true,
    },
    email:{
       type: String,
       require:true,
       trim: true, 
       unique: true,
       match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password:{
        type:String,
        require:true
    }, 
    accessToken:{
      type: String,
    },
    refID:{
        type: mongoose.Schema.Types.Number,
        ref: "Referral" 
    },
    role: {
        type: String,
        default: 'user',
        enum: [ "user", "admin"]
    },
    visible: {
        type: "boolean",
        defaultsTo: true,
        protect: true
    },
    temporaryToken: {
        type: String,
        require: true
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    referrals: [
        { 
            type: Schema.Types.Number,
             ref: 'User'
        }
    ],
    resetPasswordExpires: {
        type: Date,
        required: false
    },
    emailverified: {
        type: Boolean,
        default: false,
    },
    created_dt:{
        type:Date,
    	require:true
    }
});

UserSchema.statics.hashPassword =  async function hashPassword(password){
    return await bcrypt.hashSync(password,10)
}
UserSchema.methods.isValid = function (hashedpassword) {
    return bcrypt.compareSync(hashedpassword, this.password) || hashedpassword === this.password;
}
UserSchema.methods.generateJwt = function () {
    return jwt.sign({_id: this._id}, process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXP
        })   
}
UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};
UserSchema.methods.generateStreamKey = () => {
    return shortid.generate();
};
// UserSchema.plugin(autoIncrement.plugin, "User");
module.exports=mongoose.model("User", UserSchema);