// const { response } = require('express');
const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport')
//database connection
const User = require('../models/dbSchema');
const router  = express.Router();
router.get('/login',(req,res)=>
{
  res.render('login');
})
router.get('/register',(req,res)=>
{
  res.render('register');
})
router.post('/register',(req,res)=>
{
 const {name,email,password,password2} = req.body;
  let errors = [];
  //fiil in error
  if(!name || !email || !password || !password2)
  {
    errors.push({msg:'please fill all details'})
  }
  //password matching error
  if(password!=password2)
  {
    errors.push({msg:"Password doesn't match"})
  }
  //Password length error
  if(password.length<6)
  {errors.push({msg:"password is too short"})}
  if(errors.length>0){
    res.render('register',{
     errors,
     name,
     email,
     password,
     password2
    });
  }
  else{
    //valiadation
    User.findOne({ email: email })
    .then(user=>{
      if(user)//user exist
      {
      errors.push({msg:"User doesn't exist"})
       res.render('register',
       {
        errors,
        name,
        email,
        password,
        password2
       })
      }
      else{
        const newUser = new User({
          name,
          email,
          password,
          password2
        });
        bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(newUser.password,salt,(err,hash)=>
        {
          if(err) throw err;
          newUser.password = hash;
          
          newUser.save()//saving new user in db
          .then(user=>
            {
            req.flash('success_msg','You are now registered')
            res.redirect('../pay')
            })
          .catch(err=>console.log(err));
        }))
      }
    })
    .catch(err=>{console.log(err)})
  }
});
//  LOgin handles
router.post('/login',(req,res,next)=>
{
  passport.authenticate('local',{
    successRedirect:'/gallery',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next);
});
module.exports = router;
