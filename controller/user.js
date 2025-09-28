const User = require("../models/user.js");

module.exports.renderSignupForm =(req,res)=>{
    res.render("user/signup.ejs");
}

module.exports.signupDone = async (req,res)=>{
    try{
        let {username, email, password} = req.body;
        let newUser = new User({email, username});
        let registeruser = await User.register(newUser,password);
        console.log(registeruser);
        req.login(registeruser,(err)=> {
            if (err) { return next(err); }
            req.flash("success","welcome to wonderlust!");
            res.redirect("/listings");
          });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("user/login.ejs");
}

module.exports.loginDone = async(req,res)=>{
    req.flash("success","Wellcome back to wonderlust!");
    let redirectUrl = res.locals.redirectUrl||"/listings";
    res.redirect(redirectUrl);
}

module.exports.logoutDone = (req,res)=>{
    req.logout((err)=>{
        if(err){
            next();
        }
        else{
            req.flash("success","you are logged out!");
            res.redirect("/listings");
        }
    });
}