const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../models/user');
const Token = require('../models/token');
const Referral = require('../models/referrals');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const sendEmail = require("../utils/sendEmail");
const mailjet = require ('node-mailjet')
.connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);
module.exports = {
                       // Register Function
                       register : async(req, res) => {
                        let  encryptedPassword = await bcrypt.hash(req.body.password, 10);     
                        User.findOne({email:req.body.email}, async (err,user) => {
                          if (user) {
                            return res.status(500).json({message:'User with this email already exist'})
                          } else {
                                let user = new User({
                                    name: req.body.name,
                                    email:req.body.email,
                                    username: req.body.username,
                                    phone_number: req.body.phone_number,
                                    password: encryptedPassword,
                                    referral_code: req.body.referral_code,
                                    visible: req.body.visible,
                                    status: req.body.status,
                                    created_dt:Date.now()
                                });
                                  // Create token
                                  let email = req.body.email;
                                  let token = jwt.sign(
                                    { user_id: user._id, email },
                                    process.env.JWT_SECRET,
                                    {
                                      expiresIn: "2h",
                                    }
                                  );
                                  // save user token
                                  user.token = token;
                                  user.save(function (err,user) {
                                    if (err) {
                                        return res.status(500).json({
                                          message: err.message,
                                          // token: user.token,
                                          status: err.statusCode
                                        })
                                        } else {
                                            // email verification token
                                            let token =  new Token({
                                              userId: user._id,
                                              token: Math.floor(Math.random() * 999999)
                                            })
                                            token.save();
                                           //  invoke email service sender
                                           sendEmail(
                                             user.email,
                                             user.name,
                                            "Welcome to Prudential Invest",
                                            { name: user.name,
                                              emailVerificationCode: token['token']
                                             },
                                            "../utils/template/welcome.handlebars"
                                          );  
                                            return  res.status(200).json({
                                            user:   _.pick(user,
                                            ['name','email','token']),
                                            message:'User created successfully',        
                                        });
                                    }
                                })
                                
                          }
                        })                          
                       },
                      // Email verification function
                      verifyEmail : async(req, res) => {
                        User.findOne({_id: req.user.user_id}, async (err, user) => {
                          if (!user) {
                              return res.status(404).json({status: false, message: 'User not Found.'})
                          } else {
                            const submitted_token = req.body.token;
                            Token.findOne({token: submitted_token}, async(err, token_result) => {
                              if(err) {
                              } else {
                                  let query = {_id: req.user.user_id};
                                  let update = {emailverified: true }
                                  User.findOneAndUpdate(query, update,
                                    (err, result) => {
                                      if(err) {
                                      return res.status(501).json({
                                        status: false,
                                        message: 'An issue occur.',
                                        error: err.message
                                        })
                                      } else {
                                        Token.deleteOne({token: req.body.token}, function (err, token) {
                                          if (err) {
                                              return res.status(404).json({
                                                status: false,
                                                message: 'An issue occur.',
                                                error: err.message
                                                })
                                          } else {
                                            sendEmail(
                                              result.email,
                                              result.name,
                                            "Email Verification",
                                            { name: result.name},
                                            "../utils/template/emailverification.handlebars"
                                          ); 
                                            // save user logs so as to keep track of user activity 
                                            return res.status(200).json({
                                              message: 'Email has been verified',        
                                            });
                                          }
                                      }); 
                                      }
                                    }
                                  )
                              }
                            });
                          }
                        })
                      },
                      //  Login Function
                      login : async (req, res, next) => {
                        try {
                                //  Get user inout data
                                const { email, password } = req.body;
                                // validator to check if all input are filled up
                                if (!(email && password)) {
                                  res.status(501).json({
                                    message: 'ensure the two fields are filled with data',
                                  });
                                }
                                // function to check if email exist in db
                              const user = await User.findOne({email:req.body.email});
                              if (user && (await bcrypt.compare(password, user.password))) {
                                  // Generate an access token
                                  const accessToken = jwt.sign({ id: user._id, role: user.role },  process.env.JWT_SECRET, { expiresIn: '365d' });
                                  // save user token
                                  user.token = accessToken;
                                  // save user logs so as to keep track of user activity 
                                  let log_message = 'User logged in successfully';   
                                  let new_log = new Log({
                                            userId: user.user_id || user._id ,
                                            log_message: log_message,
                                            created_dt: Date.now()
                                        })
                                        new_log.save().then(result => {
                                            return result
                                        }).catch(error => {
                                        return error;
                                  });
                                return res.status(200).json({
                                    message:'Login Success',
                                    role:  user.role,
                                    token: user.token
                                });
                              }
                        } catch(err) {
                            return res.status(501).json({
                                message: err.message
                            });
                      }
                      },
                      // My referrals
                       myReferrals: async(req, res) => {
                          let username = req.params.username;
                          User.find({referral_code: username}, (err, docs) => {
                            if (!docs ) {
                              console.log(docs);
                              return res.status(404).json({status: false, message: 'No referral not Found.'})
                            } else {
                              console.log(docs);
                                return res.status(200).json({
                                  status: true,
                                    data:  docs
                                  })
                            }
                          }) 
                           .catch(err => res.status(500).json({message: err.message}));
                       },
                      //  Change password
                      changePassword: async (req, res) => {
                        var passwordDetails = req.body;
                        if (req.user) {
                          if (passwordDetails.new_password) {
                            User.findById(req.user.id, function (err, user) {
                              if (!err && user) {
                                console.log(user);
                                if (passport.authenticate(passwordDetails.old_password)) {
                                  if (passwordDetails.new_password === passwordDetails.c_password) {
                                    user.password = passwordDetails.new_password;
                      
                                    user.save(function (err) {
                                      if (err) {
                                        return res.status(422).send({
                                          message: err
                                        });
                                      } else {
                                        req.login(user, function (err) {
                                          if (err) {
                                            res.status(400).send(err);
                                          } else {
                                            res.send({
                                              message: 'Password changed successfully'
                                            });
                                          }
                                        });
                                      }
                                    });
                                  } else {
                                    res.status(422).send({
                                      message: 'Passwords do not match'
                                    });
                                  }
                                } else {
                                  res.status(422).send({
                                    message: 'Current password is incorrect'
                                  });
                                }
                              } else {
                                res.status(400).send({
                                  message: 'User is not found'
                                });
                              }
                            });
                          } else {
                            res.status(422).send({
                              message: 'Please provide a new password'
                            });
                          }
                        } else {
                          res.status(401).send({
                            message: 'User is not signed in'
                          });
                        }
                      },
                      // Get referral code
                      referral_code : async (req, res, next) => {
                        console.log(req.user, req.user.id);
                          await Referral.find({userid: req.user.id})
                          .populate("userid", '_id email phone_number username')
                          .exec()
                          .then(docs => {
                              if (!docs ) {
                                  return res.status(404).json({status: false, message: 'User not Found.'})
                              } else {
                                  return res.status(200).json({
                                    status: true,
                                      user:  docs
                                    })
                              } 
                          })
                          .catch(err => {
                                    res.status(500).json({err: err});
                          })


                      },
                      // get logged in user info
                      userinfo : async (req, res, next) => {
                        await User.findOne({_id: req.user.id}, (err, user) => {
                                  if (!user) {
                                      return res.status(404).json({status: false, message: 'User not Found.'})
                                  } else {
                                      return res.status(200).json({
                                        status: true,
                                          user:  _.pick(user, ['_id','name','email','phone_number', 'username', 'role'])
                                        })
                                  }
                              }
                        )
                      },
                      // upload profile picture
                      uploadProfilePicture : (req,res,next) => {
                        User.findById(req.user.id, function (err, user) {
                          if (!user) { return res.status(404).json({status: false, message: 'User not Found.'}) }
                              cloudinary.v2.uploader.upload(req.file.path, function (err,result) {
                                  if (err) {
                                      return res.status(501).json(err);
                                  } else {
                                      req.body.file = result.secure_url;
                                      user.photo = req.body.file;
                                      user.save(function (err,result) {
                                          if (err) {
                                              return res.status(501).json({
                                                  message: 'Unable to get user save'
                                              });
                                          } else {
                                              return res.status(200).json({
                                                  message: 'You have Successfully upload your profile image'
                                              });
                                          }
                                      })
                                  }
                              })
                          })
                      },
                      // 
                      // update user info
                      updateUserInfo: (req, res, next) => {
                        User.findById(req.user.id, function (err, user) {
                          if (!user) { return res.status(404).json({status: false, message: 'User not Found.'}) }

                          user.phone_number = req.body.phone_number.trim();
                          user.username = req.body.username.trim();
                          user.save(function (err,result) {
                            if (err) {
                                return res.status(501).json({
                                    message: 'Unable to get user save'
                                });
                            } else {
                                return res.status(200).json({
                                    message: 'Profile updated'
                                });
                            }
                        })
                        })
                      },
                      // Request for password reset
                      requestPasswordReset : (req, res, next) => {
                        User.findOne({email: req.body.email}, (err, user) => {
                          if (!user) {
                            return res.status(404).json({status: false, message: 'The email address ' + req.body.email + ' is not associated with any account.'})
                        } else {
                            // function to generate resefpasswordtoken
                            user.generatePasswordReset();
                            user.save()
                            .then(user => {
                                // send email
                                let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
                                const mailOptions = {
                                    to: user.email,
                                    from: process.env.FROM_EMAIL,
                                    subject: "Password change request",
                                    text: `Hi ${user.name} \n 
                                Please click on the following link ${link} to reset your password. \n\n 
                                If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                                };
                                sgMail.send(mailOptions)
                                .then(() => {
                                  res.status(200).json({message: 'A reset email has been sent to ' + user.email + '.'});
                                })
                                .catch(error => {
                                  if (error.response) {
                                    // Extract Error message!!
                                    const {message, code, response} = error;
                                  
                                    // Extract success message!!
                                    const {headers, body} = response;
                                  }
                                });
                            })
                            .catch(err => res.status(500).json({message: err.message}));
                        }
                        })
                      },
                      // Validate password reset token
                      validatePasswordResetToken : (req, res, next) => {
                        console.log(req);
                        User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
                        .then((user) => {
                            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

                            //Redirect user to form with the email address
                            res.render('reset', {user});
                        })
                        .catch(err => res.status(500).json({message: err.message}));
                      },
                      // Reset password
                      resetPassword : (req, res) => {
                        User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
                            .then((user) => {
                                if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

                                //Set the new password
                                user.password = req.body.password;
                                user.resetPasswordToken = undefined;
                                user.resetPasswordExpires = undefined;

                                // Save
                                user.save((err) => {
                                    if (err) return res.status(500).json({message: err.message});

                                    // send email
                                    const mailOptions = {
                                        to: user.email,
                                        from: process.env.FROM_EMAIL,
                                        subject: "Your password has been changed",
                                        text: `Hi ${user.name} \n 
                                        This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                                    };

                                    sgMail.send(mailOptions)
                                    .then(() => {
                                      res.status(200).json({message: 'Your password has been updated.'});
                                    })
                                    .catch(error => {
                                      if (error.response) {
                                        // Extract Error message!!
                                        const {message, code, response} = error;
                                      
                                        // Extract success message!!
                                        const {headers, body} = response;
                                      }
                                    });
                                })
                                .catch(err => res.status(500).json({message: err.message}));
                            });
                      },
}
