const mongoose = require('mongoose');
const Withdraw = require('../../models/withdraw');


// Controller for comment ranging from randomPost to video and product
module.exports = {
    // create comment for randpost
    create: async ( req, res, next) => {
        let body = {
            owner: req.user.id,
            withdraw_method: req.body.withdraw_method,
            message: req.body.message,
            token: req.body.token,
            amount: req.body.amount,
            withdraw_status: req.body.withdraw_status || "processing",
            owner: req.user.id,
            created_at: Date.now()
        }  
        // Save message
        let new_withdraw = new Withdraw(body);
        new_withdraw
        .save()
        .then(result => {
          return  res.status(200).json({
                message: "you just request a withdraw"
              });
        })
        .catch(err => {
            console.log(err);
          return  res.status(500).json({
                error: err
              })
        });
    },
    // get deposit history
    getWithHistory: async(req, res, next) => {
        Withdraw.find({ owner : req.user.id })
        .exec()
        .then(result => { 
            if (result.length == 0) {return  res.status(200).json({data: result, message: "No with made yet."});
            } else {return res.status(201).json({data: result, message: "Withdraw history returned" });
            } 
        })
        .catch(err => {
            res.status(500).json({err: err});
        })
    },
    // Get my total withdraw
    getTotalWithdraw: async(req, res, next) => {
        Withdraw.find({ owner : req.user.id })
        .exec()
        .then(result => { 
            console.log(result)
            let amounts = [];
            let totalWithdraw = 0;
            for (let index = 0; index < result.length; index++) {
                if(result[index]['withdraw_status'] === 'approve') {
                    const element =  parseInt(result[index]['amount']);
                    amounts.push(parseInt(element));
                    totalWithdraw += amounts[index];
                }
            }
            // Function to sum up array values
            // totalWithdraw  = this.getArraySum(amounts);
            console.log(totalWithdraw);
            res.status(200).json({result: totalWithdraw, message: 'Total withdraw returned'});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({err: err});
        })
    }
}
  
