// // Email Service Package Needed
// const nodemailer = require('nodemailer');
// const _ = require('lodash');
// const mailgunTransport = require('nodemailer-mailgun-transport');


// var mailSender = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       type: "login", // default
//       user:  "",
//       pass:  ""
//     }
//   });
// // const transport =  nodemailer.createTransport(mailgunOptions);
// // var defaultMail = {
// //     from: 'Me <xxx@126.com>',
// //     text: 'test text',
// // };
// var mailOptions = {
//     from: 'ajayiadeyinka6991@gmail.com',
//     to: 'horlathunbhosun@gmail.com',
//     subject: 'Sending Email via Node.js',
//     text: 'That was easy!'
// };
  
// module.exports.send = function(mail){
//     // use default setting
//     mail = _.merge({}, mailOptions, mail);
    
//     // send email
//     mailSender.sendMail(mail, function(error, info){
//         if(error) return console.log(error);
//         console.log('mail sent:', info.response);
//     });
// };