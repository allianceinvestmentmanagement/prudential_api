const express = require('express');
const router = express.Router();
const multer=require('multer');
// const cloudinary = require('cloudinary');
const JwtHelper = require('../config/jwtHelper');

// Section to upload video  
const storage = multer.diskStorage({
    filename:function (req,file,cb) {
       var datetimestamp = Date.now();
       cb(null, file.fieldname + '-' + Date.now());
       filepath = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
      cb(null, filepath);
    } 
});
const fileFilter=(req,file,cb)=> {
  //reject a filey
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'|| file.mimetype === 'image/png' ||
    'video/mp4' || 'video/x-msvideo' || 'video/3gpp'
     ) { 
    cb(null,true);
  }else{
    cb(null,false);
   }    
} 
const upload = multer({
   storage:storage,
//    limits:{fileSize :1024*1024*5},
    fileFilter:fileFilter
}); 
const single = multer({
    storage:storage,
    // limits:{fileSize :1024*1024*5},
     fileFilter:fileFilter
}); 
// user Controllers
const messageCtrl = require('../controllers/users/contact.controller');
const depositCtrl = require('../controllers/users/deposit.controller');
const withdrawCtrl = require('../controllers/users/withdraw.controller');
const investCtrl = require('../controllers/users/invest.controller');

router.post('/message', messageCtrl.create);
router.post('/deposit', JwtHelper.verifyJwtToken,  single.array('deposited_proof'), depositCtrl.create);
router.get('/wallet_history', JwtHelper.verifyJwtToken, depositCtrl.getDepositHistory);
router.get('/notifications', JwtHelper.verifyJwtToken, depositCtrl.getNotifications);
router.post('/withdraw', JwtHelper.verifyJwtToken, withdrawCtrl.create);
router.get('/withdraw_list', JwtHelper.verifyJwtToken, withdrawCtrl.getWithHistory);
router.get('/total_withdraw', JwtHelper.verifyJwtToken, withdrawCtrl.getTotalWithdraw);
router.get('/total_deposit', JwtHelper.verifyJwtToken, depositCtrl.getTotalWithdraw);

router.post('/invest', JwtHelper.verifyJwtToken, investCtrl.create);
router.get('/invest', JwtHelper.verifyJwtToken, investCtrl.getInvestHistory);
router.get('/total_investment_profit', JwtHelper.verifyJwtToken, investCtrl.getTotalInvestmentProfit);
module.exports = router;