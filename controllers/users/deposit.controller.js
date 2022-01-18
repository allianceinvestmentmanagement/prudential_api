const mongoose = require('mongoose');
const Deposit = require('../../models/deposit');
const fs = require("fs");
const _ = require('lodash');
// Cloudinary Multiple Uploader helper
const helper = require('../../utils/upload').upload;

// Controller for comment ranging from randomPost to video and product
module.exports = {
    // create comment for randpost
    create: async ( req, res, next) => {
        if (!req.files) { return res.status(501).json({status: false, message: 'Please upload a file'}) }
        // Cloundinary Function to upload video
           let filePaths = req.files;
           const files = req.files;
           console.log(files);
           try {
               let urls = [];
               let multiple = async (path) => await helper(path);
               for (const file of files) {
                   const {path} = file;
                   console.log("path", file);
                   const newPath = await multiple(path);
                   urls.push(newPath);
                   fs.unlinkSync(path);
               }
               if (urls) {
                         let body =  {
                             depositor: req.user.id,
                             deposited_amount: req.body.deposited_amount,
                             depositor_source: req.body.depositor_source,
                             depositor_message: req.body.depositor_message,
                             deposit_status:  req.body.deposit_status || "pending",
                             created_at: Date.now()
                         };
                          let body_data = _.extend(body, 
                               {deposited_proof: urls}
                             );
                             let new_deposit = new Deposit(body_data);
                             await new_deposit.save()
                                 .then(deposit => {
                                     return res.json({
                                         data: deposit,
                                     });
                                 }).catch(error => {
                                     return res.json({
                                         error:  error,
                                     });
                                 }) 
                     
               }
               if (!urls) {
                   return res.status(400)
                       .json({message: 'An error occured'})
               }
           } catch (e) {
               return next(e);
           }
    },
    // Controller to get list of personified notifications
     getNotifications() {
            Notification.find({ receiver_id : req.user.id })
            // .populate("vid", 'random_video comments bussines_owner hashtags created_at _id')
            .select('_id title body  timeStamp')
            // .exec()
            .then(docs => { 
                if (docs.length == 0) {return  res.status(200).json({message: "No notification yet."});
                } else {return res.status(201).json({data: docs, message: "notification returned" });
                } 
            })
            .catch(err => {
                res.status(500).json({err: err});
            }) 
     },
    // get deposit history
    getDepositHistory: async(req, res, next) => {
        Deposit.find({ depositor : req.user.id })
        .exec()
        .then(result => { 
            if (result.length == 0) {return  res.status(200).json({data: result, message: "No deposit made yet."});
            } else {return res.status(201).json({data: result, message: "Deposit history returned" });
            } 
        })
        .catch(err => {
            res.status(500).json({err: err});
        })
    },
    // Get my total withdraw
    getTotalWithdraw: async(req, res, next) => {
        Deposit.find({ depositor : req.user.id })
        .exec()
        .then(result => { 
            let amounts = [];
            let totaldeposit = 0;
            for (let index = 0; index < result.length; index++) {
                const element =  result[index]['deposited_amount'];
                amounts.push(parseInt(element));
                totaldeposit += amounts[index];
            }
            res.status(200).json({result: totaldeposit, message: 'Total deposit returned'});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({err: err});
        })
    }
}
  
