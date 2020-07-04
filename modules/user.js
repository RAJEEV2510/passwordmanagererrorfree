const mongoose =require('mongoose')
mongoose.connect('mongodb+srv://mongo_db_user:RAJEEV@cluster0-4o2hk.mongodb.net/<dbname>?retryWrites=true&w=majority',{useNewUrlParser:true,useCreateIndex:true})
var con =mongoose.connection;
var userSchema=new mongoose.Schema({
username:{
    type:String,
    required:true,
    index:{
        unique:true,
    }
},
email:{
    type:String,
    required:true,
    index:{
        unique:true,
    }
},
password:{
type:String,
required:true

},
date:{
    type:Date,
    default:Date.now()
}})

var userModel=mongoose.model('user',userSchema);
module.exports=userModel;