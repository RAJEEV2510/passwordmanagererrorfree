const mongoose =require('mongoose')

var con =mongoose.connection;
var passSchema=new mongoose.Schema({
password_category:{
    type:String,
    required:true,
},
project_name:{

    type:String,
    required:true
},
password_details:{
    type:String,
    required:true
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
var passModel=mongoose.model('detail',passSchema);
module.exports=passModel;