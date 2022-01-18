const express = require('express');
const router = express.Router();
const multer=require('multer');
const JwtHelper = require('../config/jwtHelper');


// Omo this is stress though but i will sort it out later.
// Section to upload category image
const storage = multer.diskStorage({
    filename:function (req,file,cb) {
       var datetimestamp = Date.now();
       cb(null, file.fieldname + '-' + Date.now());
       filepath = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
      cb(null, filepath);
    } 
  });
  const fileFilter=(req,file,cb)=> {
  //reject a file
  if (file.mimetype==='image/jpeg' || 'image/png' ) { 
    cb(null,true);
  }else{
    cb(null,false);
   }    
  } 
  const upload=multer({
   storage:storage,
   limits:{fileSize :1024*1024*5},
    fileFilter:fileFilter
  }); 

  const single = multer({
    storage:storage,
    limits:{fileSize :1024*1024*5},
     fileFilter:fileFilter
   }); 

// Authentication Controllers
const adminCtrl = require('../controllers/admin/user.controller');
router.post('/adminloinasuser', JwtHelper.verifyJwtToken, adminCtrl.AdminLoginAsUser);
router.post('/login', JwtHelper.verifyJwtToken, adminCtrl.login);
router.get('/users', JwtHelper.verifyJwtToken, adminCtrl.getAllUsers);
router.get('/messages', JwtHelper.verifyJwtToken, adminCtrl.getAllMessages);
router.get('/deposits', JwtHelper.verifyJwtToken, adminCtrl.getAllDeposit);
router.get('/withdraws', JwtHelper.verifyJwtToken, adminCtrl.getAllWithdraw);
router.get('/invests', JwtHelper.verifyJwtToken, adminCtrl.invests);
router.post('/fund_investor/:id', JwtHelper.verifyJwtToken, adminCtrl.add_fund);
router.get('/approve_deposit/:id', JwtHelper.verifyJwtToken, adminCtrl.approve_deposit);
router.get('/cancel_deposit/:id', JwtHelper.verifyJwtToken, adminCtrl.cancel_deposit);
router.delete('/delete_deposit/:id', JwtHelper.verifyJwtToken, adminCtrl.delete_deposit);
router.get('/approve_withdraw/:id', JwtHelper.verifyJwtToken, adminCtrl.approve_withdraw);
router.get('/cancel_withdraw/:id', JwtHelper.verifyJwtToken, adminCtrl.cancel_withdraw);
router.delete('/delete_user/:id', JwtHelper.verifyJwtToken, adminCtrl.deleteUser);
router.delete('/delete_investment/:id', JwtHelper.verifyJwtToken, adminCtrl.deleteInvestment);
router.delete('/delete_withdraw/:id', JwtHelper.verifyJwtToken, adminCtrl.deleteWithdraw);
router.post('/create_wallet', JwtHelper.verifyJwtToken, adminCtrl.create_wallet);
module.exports = router;
