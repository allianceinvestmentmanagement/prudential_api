const mongoose = require('mongoose');
const Invest = require('../../models/investment');


// Controller for comment ranging from randomPost to video and product
module.exports = {
    // create comment for randpost
    create: async ( req, res, next) => {
        let body = {
            investor: req.user.id,
            selected_package: req.body.selected_package,
            amount: req.body.amount,
            roi_date: req.body.roi_date,
            investment_status: req.body.investment_status || 'Processing',
            created_at: Date.now()
        }  
        // Save invest
        let new_invest = new Invest(body);
        new_invest
        .save()
        .then(result => {
          return  res.status(200).json({
                message: "Investment created"
              });
        })
        .catch(err => {
          return  res.status(500).json({
                error: err
            })
        });
    },
    // get deposit history
    getInvestHistory: async(req, res, next) => {
        Invest.find({ investor : req.user.id })
        .exec()
        .then(result => { 
            if (result.length == 0) {return  res.status(200).json({data: result, message: "No with made yet."});
            } else {return res.status(201).json({data: result, message: "Investment history returned" });
            } 
        })
        .catch(err => {
            res.status(500).json({err: err});
        })
    },
      // Get my total withdraw
      getTotalInvestmentProfit: async(req, res, next) => {
        Invest.find({ investor : req.user.id })
        .exec()
        .then(result => { 
            let amounts = [];
            let totalProfit = 0;
            for (let index = 0; index < result.length; index++) {
                const element =  result[index]['invest_profit'];
                amounts.push(parseInt(element));
                totalinvestprofit += amounts[index];
            }
            res.status(200).json({result:  totalinvestprofit, message: 'Total investment profit returned'});
        })
        .catch(err => {
            console.log(err);
          return  res.status(500).json({err: err});
        })
      }
}
  
