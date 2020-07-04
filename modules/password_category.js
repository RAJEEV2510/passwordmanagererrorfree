const mongoose =require('mongoose')
mongoose.connect('mongodb+srv://mongo_db_user:RAJEEV@cluster0-4o2hk.mongodb.net/<dbname>?retryWrites=true&w=majority',{useNewUrlParser:true,useCreateIndex:true})
var con =mongoose.connection;
var passwordSchema=new mongoose.Schema({
password_category:{
    type:String,
    required:true,

},
id:{
    type:String,
    required:true
},
date:{
    type:Date,
    default:Date.now
}
})
var passCateModel=mongoose.model('password_category',passwordSchema);
module.exports=passCateModel;