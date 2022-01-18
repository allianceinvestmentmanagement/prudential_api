const mongoose = require('mongoose');
const Message = require('../../models/message');


// Controller for comment ranging from randomPost to video and product
module.exports = {
    // create comment for randpost
    create: async ( req, res, next) => {
        let body = {
            name: req.body.name,
            phone_number: req.body.phone_number,
            subject: req.body.subject,
            email: req.body.email,
            message: req.body.message,
            created_at: Date.now()
        }  
        // Save message
        let new_message = new Message(body);
        new_message
        .save()
        .then(result => {
            res.status(200).json({
                message: "you just drop a message."
              });
        })
        .catch(err => {
          return  res.status(500).json({
                error: err
              })
        });
    }
}
  
