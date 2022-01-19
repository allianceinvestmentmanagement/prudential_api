const express=require('express');
const session = require('express-session');
const path=require('path');
const dotenv = require('dotenv').config();
require("./config/db").connect();
const cors = require('cors');
const passport = require('passport');
// intialize express instance
const app = express();


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




