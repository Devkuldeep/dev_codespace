require('dotenv').config();
const express = require('express');

const app = express()

app.get('/',(req,res)=>{
res.send("<h1>Sever is running</h1>");
})








module.exports =app