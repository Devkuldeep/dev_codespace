require("dotenv").config();
require("./database/database").connect();
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const express = require("express");
const auth = require('./middleware/auth')

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Sever is running</h1>");
});

app.post("/register", async (req, res) => {
  try {
    //get all data from body
    const { firstname, lastname, email, password } = req.body;

    // all the data should exits && {email validation ,fileds validation }
    if (!(firstname && lastname && email && password)) {
      res.status(400).send("All fields are compulsory");
    }

    //check if user already exitsts

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(401).send("User aleady exist with this email");
    }

    // encrypt password

    const myEcnPassword = await bcrypt.hash(password, 10);

    //save the user in DB

    const user = await User.create({
      //Note Exmple = firstname = user.firstname
      firstname,
      lastname,
      email,
      password: myEcnPassword,
    });

    // generate a token for user and send it.

    const token = jwt.sign(
      {
        id: user._id,
        email, //also email = user.email
      }, //user._id mongodb make implicit id for each data
      "shhhh", //process.env.jwtsecret
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    user.password = undefined; //if you don't wanna send to frontend

    res.status(201).json({ user });
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    //get all data from frontend

    const { email, password } = req.body;

    //validation
    if (!(email && password)) {
      res.status(400).send("send all data");
    }

    //find user in Db

    const user = await User.findOne({ email });

    //if user not exist
    if (!user) {
      res.status(401).send("user not exists");
    }

    //match the passwrd

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user._id },
        "shhhh", //process.env.jwtsecret
        {
          expiresIn: "2h",
        }
      );

      user.token = token;
      user.password = undefined;

      //send a token in user cookie
      //cookie section

      const option = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.status(200).cookie({"token":token}, option).json({
        success: true,
        token,
        user,
      });
    }
  } catch (error) {
    console.log(error);
  }
});




app.get('/dashboard',auth,(req,res)=>{

  console.log(req.user);
  
    res.send('<h1>Welcome to dashboard</h1>');
})


app.get('/settings',auth,(req,res)=>{


    
      res.send('<h1>Here are your user settings</h1>');
  })
module.exports = app;
