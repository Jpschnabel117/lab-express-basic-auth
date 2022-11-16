const isLoggedIn = (req, res, next) => {
  //middleware
  if (!req.session.currentUser) {
    //checking if logged in to go to profile
    res.redirect("/");
    return;
  }
  next();
};

const isAnon = (req, res, next) => {
    //middleware
    if (req.session.currentUser) {
      //checking if logged in to go to profile
      res.redirect("/userProfile");
      return;
    }
    next();
  };
  

module.exports = {
    isLoggedIn , 
    isAnon,
};