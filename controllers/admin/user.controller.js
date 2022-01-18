const mongoose = require('mongoose');
const passport = require('passport');
const request = require('request');
const User = require('../../models/user');
const Deposit = require('../../models/deposit');
const Withdraw = require('../../models/withdraw');
const Message = require('../../models/message');
const Wallet = require('../../models/owner_wallet');
const Notification = require('../../models/notifications');
const Investment = require('../../models/investment');
const jwt = require('jsonwebtoken');
// Section for user management by admin
// Admin login to user account
module.exports.AdminLoginAsUser = (req, res, next) => {
    let userEmailAddress = req.body.email;      
    User.findOne({email:userEmailAddress}, (err,user) => {
      if (user) {
        return res.status(200).json({
                userdetails: user,
                message: "User data returned"
            })
      } else {
        res.status(404).json({message:'User with this email already exist'});
      }
    })
}
module.exports.login = (req, res, next) => {
         if(req.body._id) {
              // Generate an access token
              const accessToken = jwt.sign({ id: req.body._id },  process.env.JWT_SECRET);
                return res.status(200).json({
                  message:'Login Success',
                //   role:  user.role,
                  token: accessToken
                });
            } else {
                res.status(404).json({
                    message: 'An issue occured'
                });
            }
}
// get buyers
module.exports.getAllUsers = (req, res, next) => {
    User.find()
    .select('_id name username email role phone_number password photo created_at')
    .exec()
    .then(docs => { 
        if (docs) {
            res.status(200).json({
              data: docs,
              message: "User fetched successfully"
            });
        } else {
            res.status(404).json();
        } 
    })
    .catch(err => {
              res.status(500).json({err: err});
    })
}

// Delete user from admin end
module.exports.deleteUser = (req, res, next) => {
    let id = req.params.id;
    User.findByIdAndRemove({_id:id}, (err,result) => {
                if(err) {
                    return  res.status(501).json({
                        err: err
                    })  
                } else {
                        return  res.status(200).json({
                                message: "User delete Successfully",
                            })  
                }
    }) 
}
module.exports.getAllDeposit = (req, res, next) => {
    Deposit.find()
    .populate("depositor", 'address  name _id email phone_number username')
    .exec()
    .then(docs => { 
        if (docs) {
            res.status(200).json({
              data: docs,
              message: "Deposit fetched successfully"
            });
        } else {
            res.status(404).json();
        } 
    })
    .catch(err => {
              res.status(500).json({err: err});
    })
}
module.exports.getAllWithdraw = (req, res, next) => {
    Withdraw.find()
    .populate("owner", 'address  name _id email phone_number username')
    .exec()
    .then(docs => { 
        if (docs) {
            res.status(200).json({
              data: docs,
              message: "Withdraws fetched successfully"
            });
        } else {
            res.status(404).json();
        } 
    })
    .catch(err => {
              res.status(500).json({err: err});
    })
}

module.exports.getAllMessages = (req, res, next) => {
    Message.find()
    .exec()
    .then(docs => { 
        if (docs) {
            res.status(200).json({
              data: docs,
              message: "Message fetched successfully"
            });
        } else {
            res.status(404).json();
        } 
    })
    .catch(err => {
              res.status(500).json({err: err});
    })
}
// Controller to approve deposit
module.exports.approve_deposit = async(req, res, next)  => {
    let id = req.params.id;
    Deposit.findOne({_id:id}, (err,result) => {
                if(err) {
                    return  res.status(501).json({
                        err: err
                    })  
                } else {
                        //  Section to update user role to seller.
                        result.deposit_status = 'confirmed';
                        result.save().then( data => {
                             // Section to drop a notification for the buyers start
                             let title = "Deposit Confirmed";
                             let body = `Your deposit has been approved successfully!!`;
                             let notified = new Notification({
                                 receiver_id: data.depositor,
                                 title: title,
                                 body: body,
                                 timeStamp: Date.now(),
                             })
                         notified.save();
                        return  res.status(200).json({
                                message: "Deposit confirmed",
                                data: data
                            })  
                        }, err => {
                            return res.status(500).json({message: err})
                        }) 
                }
    })
}
// Controller to cancel deposit
module.exports.cancel_deposit = async(req, res, next)  => {
    let id = req.params.id;
    Deposit.findOne({_id:id}, (err,result) => {
                if(err) {
                    return  res.status(501).json({
                        err: err
                    })  
                } else {
                        result.deposit_status = 'unconfirmed';
                        result.save().then( data => {
                            let title = "Deposit unApproved";
                            let body = `Your deposit has not been approved successfully!!`;
                            let notified = new Notification({
                                receiver_id: data.depositor,
                                title: title,
                                body: body,
                                timeStamp: Date.now(),
                            })
                        notified.save();
                        return  res.status(200).json({
                                message: "Deposit unconfirmed",
                                data: data
                            })  
                        }, err => {
                            return res.status(500).json({message: err})
                        }) 
                }
    })
}
// Controller to delete deposit
module.exports.delete_deposit = (req, res, next) => {
    let id = req.params.id;
    Deposit.findByIdAndRemove({_id:id}, (err,result) => {
                if(err) {
                    return  res.status(501).json({
                        err: err
                    })  
                } else {
                        return  res.status(200).json({
                                message: "Deposit request delete Successfully",
                        })  
                }
    }) 
}
// Controller to approve withdraw
module.exports.approve_withdraw = async(req, res, next)  => {
    let id = req.params.id;
    Withdraw.findOne({_id:id}, (err,result) => {
                if(err) {
                    return  res.status(501).json({
                        err: err
                    })  
                } else {
                        result.withdraw_status = 'approve';
                        result.save().then( data => {
                            let title = "Withdraw Approved";
                            let body = `Your withdraw has been approved successfully!!`;
                            let notified = new Notification({
                                receiver_id: data.owner,
                                title: title,
                                body: body,
                                timeStamp: Date.now(),
                            })
                        notified.save();
                        return  res.status(200).json({
                                message: "Withdraw approved",
                                data: data
                            })  
                        }, err => {
                            return res.status(500).json({message: err})
                        }) 
                }
    })
}


// Controller to cancel withdraw
module.exports.cancel_withdraw = async(req, res, next)  => {
    let id = req.params.id;
    Withdraw.findOne({_id:id}, (err,result) => {
                if(err) {
                    return  res.status(501).json({
                        err: err
                    })  
                } else {
                        result.withdraw_status = 'unapproved';
                        result.save().then( data => {
                            let title = "Withdraw unApproved";
                            let body = `Your withdraw has not been  approved successfully!!`;
                            let notified = new Notification({
                                receiver_id: data.owner,
                                title: title,
                                body: body,
                                timeStamp: Date.now(),
                            })
                        notified.save();
                        return  res.status(200).json({
                                message: "Deposit unapproved",
                                data: data
                            })  
                        }, err => {
                            return res.status(500).json({message: err})
                        }) 
                }
    })
}

// Controlller to 
module.exports.create_wallet =  async ( req, res, next) => {
        let body = {
            wallet_token: req.body.wallet_token,
            wallet_name: req.body.wallet_name,
            created_at: Date.now()
        }  
        // Save message
        let new_wallet = new Wallet(body);
        new_wallet
        .save()
        .then(result => {
            res.status(200).json({
                message: "you just create a wallet."
              });
        })
        .catch(err => {
          return  res.status(500).json({
                error: err
              })
        });
}

// controller to fetch invest
module.exports.invests = async (req, res, next) => {
    Investment.find()
    .populate("investor", 'address  name _id email phone_number username')
    .exec()
    .then(docs => { 
        if (docs) {
            res.status(200).json({
              data: docs,
              message: "investment fetched successfully"
            });
        } else {
            res.status(404).json();
        } 
    })
    .catch(err => {
              res.status(500).json({err: err});
    }) 
}
// Controller to delete investment
module.exports.deleteInvestment = (req, res, next) => {
    let id = req.params.id;
    Investment.findByIdAndRemove({_id:id}, (err,result) => {
                if(err) {
                    return  res.status(501).json({
                        err: err
                    })  
                } else {
                        return  res.status(200).json({
                                message: "Investment delete Successfully",
                        })  
                }
    }) 
}
// Controller to delete withdraw
module.exports.deleteWithdraw = (req, res, next) => {
    let id = req.params.id;
    Withdraw.findByIdAndRemove({_id:id}, (err,result) => {
                if(err) {
                    return  res.status(501).json({
                        err: err
                    })  
                } else {
                        return  res.status(200).json({
                                message: "Withdraw request delete Successfully",
                        })  
                }
    }) 
}

// Function to add fund for investor
module.exports.add_fund = async (req, res, next) => {
    let id = req.params.id;
    Investment.findOne({_id:id}, (err,result) => {
        if (err) {
              return res.status(500).json({message:'An error occured'})
        } else {
            result.invest_profit = req.body.invest_profit;
            result.save().then( data => {
              return  res.status(200).json({
                    message: "Profit added successfully"
                  })  
            }, err => {
                return res.status(500).json({message: err})
            })  
        }   
    })
}