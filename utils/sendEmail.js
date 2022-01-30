const Handlebars = require('handlebars');
const fs = require('fs');
const path=require('path');
const mailjet = require ('node-mailjet')
.connect('81b7d5c0cf4356c310315640795441d4', '1eaee42bc77173c2ec098d3368ea48e3')
// .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

// Function to send email
const sendEmail = async (email, receiver_name, subject, payload, template) => {
    try {
     // process my email template design 
     const source = fs.readFileSync(path.join(__dirname, template), "utf8");
     const compiledTemplate = Handlebars.compile(source); 
     // create reusable transporter object using the default SMTP transport
     const request = mailjet
     .post("send", {'version': 'v3.1'})
     .request({
        "Messages":[
            {
              "From": {
                "Email": "prudentialinvestplc@info.com",
                "Name": "Prudential"
              },
              "To": [
                {
                  "Email": "prudentialinvestplc@gmail.com",
                  "Name": "Prudential"
                }
              ],
              "Subject": "Greetings from Mailjet.",
              "TextPart": "My first Mailjet email",
              "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
              "CustomID": "AppGettingStartedTest"
            }
          ]
        //  "Messages":[{
        //      "From": {
        //          "Email": process.env.MJ_AUTH_EMAIL,
        //          "Name": process.env.MJ_AUTH_USERNAME
        //      },
        //      "To": [{
        //          "Email": email,
        //          "Name": receiver_name,
        //      }],
        //      "Subject": subject,
        //      "HTMLPart": compiledTemplate(payload),
        // }]
     })
    //  Call backs
     request.then((result) => {
         console.log('Result space shown', result.body)
     })
     .catch((err) => {
         console.log('Error Result space shown 1', err)
     })
 
    } catch (error) {
        console.log('Error Result space shown 2', error);
        return error;
    }
};

module.exports = sendEmail;