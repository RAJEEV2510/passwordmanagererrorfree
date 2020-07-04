var express = require('express');
var router = express.Router();
var userModel=require('../modules/user')
var bycrpyt=require('bcrypt')
var passModel=require('../modules/add_password')
var passCatModel=require('../modules/password_category')
var jwt=require('jsonwebtoken')
var app = express();
const { check, validationResult, Result } = require('express-validator');
var getPassword_category=passCatModel.find({});
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


 /* GET home page. login form */
router.get('/', function(req, res, next) {

var loginuser=localStorage.getItem('user')
console.log('--------hello-----',req.session.username)
if(req.session.username)
{
  res.redirect('/dashboard')
}
else{
 
res.render('index', { title: 'Password Management' ,msg:''});
}
});
/* GET home page.  post request login form */
router.post('/', function(req, res, next) {
  var username=req.body.username;
  var password=req.body.password;
   var checks=userModel.findOne({username:username})    
  checks.exec((err,data)=>{
    if(data){
    var getuserid=data.id;
    var getPassword=data.password;
//compare  hash value
    if(bycrpyt.compareSync(password,getPassword) ){
    var token=jwt.sign({userid:getuserid},'loginToken')
    localStorage.setItem('user',token)
    localStorage.setItem('username',username)
    localStorage.setItem('id',getuserid)
    req.session.username=getuserid
      
  
    res.redirect('/dashboard')
}
  
    else
    {
      res.render('index', { title: 'Password Management',msg:'Username or Password incorrect' });
    }
  }
  else{
    res.render('index', { title: 'Password Management',msg:'Username or Password incorrect' });
  }
  })
  
});

/*checklogin middleware */
function checklogin(req,res,next)
{
  var user=localStorage.getItem('user')
  try{
    if(req.session.username)
    {
              jwt.verify(user,'loginToken')

        }
        else{
          res.redirect('/')
        }
      }
  catch(err){
    res.redirect('/')
  }
  next()
}

/* dashboard*/

router.get('/dashboard',checklogin,(req,res)=>{
var loginuser=localStorage.getItem('username')
res.render('dashboard',{title:'dashboard',loginuser:loginuser})


})
/* logout for user*/
router.get('/logout',(req,res)=>{
  
  localStorage.removeItem('user')
  localStorage.removeItem('username')
  req.session.destroy()
  res.redirect('/')
})

/*middle ware checkEmail */
function checkEmail(req,res,next)
{
  var email=req.body.email;
  var checkexistEmail=userModel.findOne({email:email})
  checkexistEmail.exec((err,data)=>{
    if(err) throw err
    if(data)
    {
     return res.render('signup', { title: 'Password Management',msg:"email already exist" });      
    }
  
    next()
  })

}
/*middleware username */
function checkusername(req,res,next)
{
  var username=req.body.username;
  var checkexistUsername=userModel.findOne({username:username})
  checkexistUsername.exec((err,data)=>{
    if(err) throw err
    if(data)
    {
     return res.render('signup', { title: 'Password Management',msg:"username  already exist" });      
    }
  
    next()
  })}



/*signup get request */
router.get('/signup', function(req, res, next) {
  var loginuser=localStorage.getItem('user')
  if(req.session.username)
  {
   res.redirect('/dashboard')
  }
    res.render('signup', { title: 'Password Management',msg:"" });
});

/*--------------------------POST METHOD FOR SIGN UP------------------------------------------------------*/ 
router.post('/signup',checkusername,checkEmail ,function(req, res, next) {
var username=req.body.username
var email=req.body.email
var password=req.body.password
var confirmpassword=req.body.confirmpassword

if(password==confirmpassword){
password=bycrpyt.hashSync(password,10) 
var userDetails= new userModel({
username:username,
email:email,
password:password,
})
userDetails.save((err,doc)=>{
res.render('signup', { title: 'Password Management' ,msg:'registered succesfully'});
})
}
else{
res.render('signup', { title: 'Password Management' ,msg:'confirmation password  or password is not same'});
}
});



router.get('/passwordcategory',checklogin, function(req, res, next) {
  var id=req.session.username
  
  var viewCategory=passCatModel.find({id:id})
  viewCategory.exec((err,data)=>{
    if(data){
    res.render('passwordcategory',{title:'Add New password',records:data})
    }
    res.render('passwordcategory',{title:'Add New password',records:''})
  })
});
/*ADD NEW CATEGORY  GET METHOD */
router.get('/Addnewcategory',checklogin,(req,res,next)=>{

  res.render('Addnewcategory',{title:'Add new Category',er:'',pass:''})
})

/*ADD NEW CATEGORY  insert data into document using POST METHOD */

router.post('/Addnewcategory',checklogin,[check('passwordCategory','Enter password category name').isLength({ min: 4 })],(req,res,next)=>{
  var id =req.session.username
  
  const errors=validationResult(req)
  if(!errors.isEmpty())
  {
      res.render('Addnewcategory',{title:'Add new Category',er:errors.mapped(),pass:''})
  }
  else{

    var passwordDetails=new passCatModel({
      password_category:req.body.passwordCategory,
      id:id
       })
     passwordDetails.save((err,doc)=>{
      res.render('Addnewcategory',{title:'Add new Category',er:'',pass:'Category has been Added'})
     })
  }
})

/*DELETE FROM PASSWORD*/ 

router.get('/delete/:id/',(req,res)=>{
var id=req.params.id  ;
var del=passCatModel.deleteOne({_id:id})
del.exec()
res.redirect('/passwordcategory')

})
/*update in password catgory */
router.get('/edit/:id',(req,res)=>{

var id =req.params.id;
res.render('edit',{title:'edit',id:id,err:''})
})
router.post('/edit/:id',[check('passwordCategory','Enter password category name').isLength({ min: 2 })],(req,res)=>{

  var id=req.body.id;
  const errors=validationResult(req)
  if(!errors.isEmpty())
  {
      res.render('edit',{title:'Add new Category',id:id,err:errors.mapped()})
  }
 else{
  var val=req.body.passwordCategory;
  var update=passCatModel.findByIdAndUpdate(id,{password_category:val})
  update.exec((err,doc)=>{
  res.redirect('/passwordcategory')
  })
  }
  })
/*add new password fetch data from password category */  
router.get('/Addnewpassword',checklogin,(req,res)=>{
var id =req.session.username
var view=passCatModel.find({id:id})
.exec((err,data)=>{
if(data){
res.render('Addnewpassword',{title:'Add New password',records:data,success:''})
}
else{
  res.render('Addnewpassword',{title:'Add New password',records:'',success:''})
}
})
})

/*insert data into database  using schema  POST*/
router.post('/Addnewpassword',checklogin,(req,res)=>{
  var category=req.body.categoryPass
  var passwordDetails=req.body.pass_details
  var project_name=req.body.project_name;
 
  var id =req.session.username
 
  var details= new passModel({

    password_category:category,
    project_name:project_name,
    password_details:passwordDetails,
    id:id
})
  details.save((err,data)=>{
    if(err) throw err
    res.render('Addnewpassword',{title:'Add New password',records:'',success:'password details inserted succesfully'})

  });})

/*view all password get method  with filtering data*/

  router.get('/viewallpassword',checklogin,(req,res)=>{
    
  var id =req.session.username
  var getAllpassword=passModel.find({id:id})
  getAllpassword.exec((err,data)=>{
  if(data){
  res.render('viewallpassword',{title:'Add New password',records:data})
  }
  else{
    res.render('viewallpassword',{title:'Add New password',records:''})
  }
  })

})




// /*Join tables */

// router.get('/viewallpassword/joint',checklogin,(req,res)=>{
    
//   passModel.aggregate([{
// $lookup:
// {
//   from:'password_categories',
//   localField:'password_category ',
//   foreignField:'password_category ',
//   as:'pass_cat_details',
  

// }}]).exec(s(err,result)=>{
//   if(err) throw err
//   console.log(result)

//   res.send(result)

//   })})
module.exports = router;
