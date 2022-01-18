const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../models/user');
const Referral = require('../models/referrals');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const fs = require('fs'),
path = require('path');
const Handlebars = require('handlebars');
const mailjet = require ('node-mailjet')
.connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);


// Watch list email template
// Open template file
var source = fs.readFileSync(path.join(__dirname, '../utils/template/watchlist.handlebars'), 'utf8');
// Create email generator
var template = Handlebars.compile(source);

module.exports = {
                      reset : async(req, res) => {                        
                      },
                      // Function to get all watch list
                      getAllWatchList : async(req, res, next) => {
                        WatchList.find()
                        .select()
                        .exec()
                        .then(docs => { 
                            if(docs) {
                                res.status(200).json({
                                  data: docs,
                                  message: "WatchList fetched successfully"
                                });
                            } else {
                                res.status(404).json();
                            } 
                        })
                        .catch(err => {
                                  res.status(500).json({err: err});
                        })
                       },
                      // Watch list
                      watch: async(req, res) => {  
                        console.log(req.body);
                         // Rough codes 
                         const request = mailjet
                         .post("send", {'version': 'v3.1'})
                         .request({
                           "Messages":[
                             {
                               "From": {
                                 "Email": `${process.env.MJ_COMPANY_EMAIL}`,
                                 "Name":  `${process.env.MJ_COMPANY_NAME}`
                               },
                               "To": [
                                 {
                                   "Email": req.body.email,
                                 }
                               ],
                               "Subject": " Welcome to Prudential Invest plc ",
                               // "TextPart": "My first Mailjet email",
                               "HTMLPart": template(),
                             }
                           ]
                         })      
                         return  request.then((result) => {
                           console.log(result.body)
                           res.status(200).json({
                             message: 'You have been successfully added to the watchlist',        
                         });
                         })
                         .catch((err) => {
                           console.log(err);
                           console.log(err.statusCode)
                         })     
                        // WatchList.findOne({email:req.body.email}, (err,result) => {
                        //         if (result) {
                        //           return res.status(500).json({message:'User with this email already exist'})
                        //         } else {
                        //                 let watchList = new WatchList({
                        //                     email:req.body.email,
                        //                     created_at:Date.now()
                        //                 });
                        //                 watchList.save(function (err, result) {
                        //                       if (err) {
                        //                           return res.status(500).json({
                        //                             message: err.message
                        //                           })
                        //                           } else {  
                        //                             // Rough codes 
                        //                             const request = mailjet
                        //                               .post("send", {'version': 'v3.1'})
                        //                               .request({
                        //                                 "Messages":[
                        //                                   {
                        //                                     "From": {
                        //                                       "Email": `${process.env.MJ_COMPANY_EMAIL}`,
                        //                                       "Name":  `${process.env.MJ_COMPANY_NAME}`
                        //                                     },
                        //                                     "To": [
                        //                                       {
                        //                                         "Email": req.body.email,
                        //                                       }
                        //                                     ],
                        //                                     "Subject": " Welcome to our WatchList!!! ",
                        //                                     // "TextPart": "My first Mailjet email",
                        //                                     "HTMLPart": template(),
                        //                                   }
                        //                                 ]
                        //                               })      
                        //                               return  request.then((result) => {
                        //                                 console.log(result.body)
                        //                                 res.status(200).json({
                        //                                   message: 'You have been successfully added to the watchlist',        
                        //                               });
                        //                               })
                        //                               .catch((err) => {
                        //                                 console.log(err.statusCode)
                        //                               })         
                                                    
                        //                       }
                        //                   })
                        //         }
                        // })                          
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
                      // Register Function
                      register : async(req, res) => {
                        // await User.hashPassword();
                              let password = req.body.password;      
                              User.findOne({email:req.body.email}, (err,user) => {
                                if (user) {
                                  return res.status(500).json({message:'User with this email already exist'})
                                } else {
                                      let user = new User({
                                          name: req.body.name,
                                          email:req.body.email,
                                          phone_number: req.body.phone_number,
                                          username: req.body.username,
                                          password: password,
                                          referral_code: req.body.referral_code,
                                          c_password: req.body.c_password,
                                          role: req.body.role ,
                                          created_dt:Date.now()
                                      });
                                      if (!req.body.referral_code) {
                                          user.save(function (err,user) {
                                              if (err) {
                                                console.log(err);
                                                  return res.status(500).json({
                                                    message: err.message
                                                  })
                                                  } else { 
                                                    console.log('user re oo', user);
                                                    let referral = new Referral({
                                                      referral_code: uuidv4(),
                                                      userid: user._id,
                                                    })
                                                    referral.save();
                                                        // Sending order detail email
                                                        const mailOptions = {
                                                          to: req.body.email,
                                                          from: process.env.FROM_EMAIL,
                                                          subject: `${obj.subject}`,
                                                          html:  htmlTemplate
                                                      };
                                                      sgMail.send(mailOptions)                  
                                                      return  res.status(200).json({
                                                      user:   _.pick(user, ['name','email','phonenumber', 'photo', 'role']),
                                                      message: 'User created successfully',        
                                                  });
                                              }
                                          })
                                      } else {
                                        user.save(function (err,user) {
                                          if (err) {
                                              return res.status(500).json({
                                                message: err.message
                                              })
                                              } else { 
                                                Referral.findOne({referral_code: req.body.referral_code}, (err, result) => {

                                                })
                                                let referral = new Referral({
                                                  referral_code: uuidv4(),
                                                  userid: user._id,
                                                })
                                                referral.save();
                                                //  Generate 20 bit activation code, with ‘crypto’ is a nodejs built in package.
                                                      // Sending order detail email
                                                      const mailOptions = {
                                                        to: req.body.email,
                                                        from: process.env.FROM_EMAIL,
                                                        subject: `${obj.subject}`,
                                                        html:  htmlTemplate
                                                    };
                                                    sgMail.send(mailOptions)            
                                                  return  res.status(200).json({
                                                  user:   _.pick(user, ['name','email','phone_number', 'photo', 'role']),
                                                  message:'User created successfully',        
                                              });
                                          }
                                      })
                                      }
                                }
                              })                          
                      },
                      // Register with referral
                      //  Login Function
                      login : async (req, res, next) => {
                        // method to call Passport js authenticate function
                        await  passport.authenticate('local', function(err, user, info) {
                            if (err) { 
                              return res.status(500).json({
                                message: err.message
                              })
                          }
                            if (!user) { 
                              return res.status(501).json(info);
                              }
                            req.logIn(user,function(err) {
                              if (err) { 
                                return res.status(501).json({err: err});
                              } else {
                              // Generate an access token
                              const accessToken = jwt.sign({ id: user._id },  process.env.JWT_SECRET);
                                return res.status(200).json({
                                  message:'Login Success',
                                  role:  user.role,
                                  token: accessToken
                                });
                              }
                            });
                        })(req, res, next);
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
