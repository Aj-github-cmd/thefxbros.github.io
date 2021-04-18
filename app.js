const express = require('express')
const expressLayout = require('express-ejs-layouts')
const path = require('path')
const port = process.env.PORT||4080;
const Mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const paypal =  require('paypal-rest-sdk');
const app = express();
const passport = require('passport');
//passport config
require('./config/passport')(passport);
//database config
const db = require('./config/keys').MongoURI;
Mongoose.set('useUnifiedTopology', true);
Mongoose.connect(db,{ useNewUrlParser: true })
.then(console.log('mongodb connected properly'))
.catch(err=>{console.log(err)});

app.use(express.urlencoded({extended:false}));
//session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
//passport middlewire
app.use(passport.initialize());
app.use(passport.session());
//flash
app.use(flash());
  //global var for flash msg
  app.use((req,res,next)=>
  {
      res.locals.success_msg = req.flash('success_msg')
      res.locals.error_msg = req.flash('error_msg')
      res.locals.error = req.flash('error')
      next();
  })
//Routing
app.use('/',require('./routers/index')) 
app.use('/users',require('./routers/users'))
//EJS templating for auth app
app.use(expressLayout);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname, 'public')));

//payment gateway
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AXJtW86A0wFt2sy7R0c8-EcHsCkE7CM8tVhIqgnAI4Ymo2hpbSnOWF1YIzU99botPWirmslHaVK_1vXn',
  'client_secret': 'EH_JBzsorevw5KXztifAiNqKXi6ttCfrm7VlxWrrcfF-tvvezlTRo6ws9Ukl6VCP5YrJXEhd_z-gD7Tm'
});
app.post('/paypal',(req,res)=>
{
  const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "https://aj-github-cmd.github.io/fxbrosacademy.github.io/success",
          "cancel_url": "https://aj-github-cmd.github.io/fxbrosacademy.github.io/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "course1",
                  "sku": "1",
                  "price": "500.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "500.00"
          },
          "description": "payment for course"
      }]
  };
  
  
  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
         
         for(let i = 0;i< payment.links.length;i++)
       {
         if(payment.links[i].rel === 'approval_url')
         {
             res.redirect(payment.links[i].href);
         }
       }           
      }
      // console.log(payment)
  });
});
app.get('/success',(req,res)=>{
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "500.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          // throw error;
      } else {
          // console.log(JSON.stringify(payment));
          res.sendFile(path.join(__dirname+'/success.html'));
      }
  });
});
app.get('/cancel',(req,res)=>
{
  res.send('payment failed');
})


app.listen(port,()=>
{
    console.log('Server listening at 4080');
})
