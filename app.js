var express=require('express');
var session = require('express-session');
var path=require('path');
const dotenv = require('dotenv').config();
require("./config/db").connect();
var cors = require('cors');
var passport = require('passport');
const fs = require('fs');
const Handlebars = require('handlebars');
const mailjet = require ('node-mailjet')
.connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);


// Watch list email template
// Open template file
const source = fs.readFileSync(path.join(__dirname, './utils/template/watchlist.handlebars'), 'utf8');
// Create email generator
const template = Handlebars.compile(source);
// intialize express instance
var app = express();


// declare routing section
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: '*'
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

require('./config/passport');
app.use(passport.initialize());

// view engine setup
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyparser.json());

// Api endpoint setup
app.use('/api/v1', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', userRouter);

app.get('/', (req,res) => {
  res.json({
    welcome_note: 'Welcome to Prudential Invest Plc',
  });
});
app.listen(port, () => {
         console.log('Server is running on' + '--' + port);        
})




