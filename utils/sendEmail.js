const Handlebars = require('handlebars');
const fs = require('fs');
const path=require('path');
const mailjet = require ('node-mailjet')
.connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

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
       "Messages": [
         {
           "From": {"Email": "info@agrop.co","Name": "Prudential Limited"},
           "To":   [{ "Email": `${email}`, "Name": `${receiver_name}`}],
           "Subject": `${subject}`,
           "HTMLPart": compiledTemplate(payload),
         }
       ]
     })      
     return request.then((result) => {
       console.log(result.body)
     })
     .catch((err) => {
       console.log(err)
     })  
    } catch (error) {
        console.log('Error Result space shown 2', error);
        return error;
    }
};

module.exports = sendEmail;