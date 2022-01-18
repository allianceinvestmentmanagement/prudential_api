const jwt = require('jsonwebtoken');


module.exports.verifyJwtToken = (req,res,next) => {
    var token;

    if ('authorization' in req.headers)
           // Token extracted from the client side header stored to token varaible     
                token = req.headers['authorization'].split(' ')[1];
          //   If statement to check the token exist or not
                if (!token) {
                return res.status(403).send({auth: false, message: 'No Token Provided'})  
                } else{
                        jwt.verify(token, process.env.JWT_SECRET,
                        (err, decoded) => {
                                if (err) {
                                return res.status(500).send({auth: false, message: 'Token authentication failed'}) 
                                } else {
                                req.user = decoded;
                                next();
                                }
                        })

                }
}