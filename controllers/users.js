const User = require("../models/user");
const Listing = require("../models/listing");




module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    // Populate owner username
    const listing = await Listing.findById(id).populate('owner', 'username');

    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.renderSignup =  ( req, res) => {
    res.render("users/signup.ejs");
};

module.exports.Signup = async( req, res) => {
    try{
    let {username , email ,password} = req.body;
    const newUser = new User({ email , username});
    const registeredUser = await User.register(newUser , password);
    console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
    req.flash("success", "welcome to wonderlust");
    res.redirect("/listings");
        }) ;
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};


module.exports.renderLogin = ( req, res) => {
    res.render("users/login.ejs");
};



module.exports.Login =  async( req, res) => {
        req.flash("success" , "welcome back Sir,");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    };


   module.exports.Logout  = (req, res) => {
    req.logout((err) => {
        if(err){
          return  next(err);
        }
        req.flash("success", "you are LOGoUT");
        res.redirect("/listings");
    })
};
