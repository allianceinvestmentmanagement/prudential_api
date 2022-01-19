const express = require('express');
const router = express.Router();
const multer=require('multer');
// const cloudinary = require('cloudinary');
const JwtHelper = require('../config/jwtHelper');
// section to upload profile image
   const storage = multer.diskStorage({
    filename:function (req,file,cb) {
       var datetimestamp = Date.now();
       cb(null, file.fieldname + '-' + Date.now());
       filepath = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
      cb(null, filepath);
    } 
  });
  const fileFilter=(req,file,cb)=> {
  // reject a file
  if (file.mimetype==='image/jpeg' || 'image/png' ) { 
    cb(null,true);
  } else {
    cb(null,false);
   }    
  } 
  const upload=multer({
   storage:storage,
   limits:{fileSize :1024*1024*5},
    fileFilter:fileFilter
  });

// Authentication Controllers
const authCtrl = require('../controllers/auth.controller');
router.get('/', (req,res) => {
  res.json({
    welcome_note: ' Invest Plc',
  });
});
// Authentication Routes 
router.post('/login', authCtrl.login);
router.post('/register', authCtrl.register);

router.post('/emailVerification', JwtHelper.verifyJwtToken, authCtrl.verifyEmail);
router.get('/userInfo', JwtHelper.verifyJwtToken, authCtrl.userinfo);
router.post('/changePassword', JwtHelper.verifyJwtToken, authCtrl.changePassword);
router.get('/getCode', JwtHelper.verifyJwtToken, authCtrl.referral_code);
router.get('/my_referral/:username', JwtHelper.verifyJwtToken, authCtrl.myReferrals);
router.post('/profilePicture',  JwtHelper.verifyJwtToken, upload.single('photo'), authCtrl.uploadProfilePicture);
router.post('/updateuserinfo', JwtHelper.verifyJwtToken,  authCtrl.updateUserInfo);
router.post('/resetpassword', JwtHelper.verifyJwtToken,  authCtrl.requestPasswordReset);
router.get('/validatepasswordtoken/:token', JwtHelper.verifyJwtToken,  authCtrl.validatePasswordResetToken);
router.post('/reset', JwtHelper.verifyJwtToken,  authCtrl.resetPassword);

module.exports = router;