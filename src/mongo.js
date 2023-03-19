const mongoose=require("mongoose")
const dotenv = require("dotenv").config()

mongoose.connect(process.env.URL)
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{ 
    console.log('failed');
})

const logInSchema=new mongoose.Schema({
    domain:{
        type:String,
        required:true,
    },
    wordcount:{
        type:Number,
        required:true
    },
    weblink:{
        type: Array,
        "default": [],
    },
    medialink:{
        type: Array,
        "default": [],
    },
},{
    timestamps: true,
})

const LogInCollection=new mongoose.model('LogInCollection',logInSchema)

module.exports=LogInCollection