
const auth = (req, res, next) => {
  if(!req.session.loggedIn) {
    res.redirect('/users/login');
  }
  next();
};

const loggedIn = (req, res, next) => {
  if(req.session.loggedIn) {
    res.redirect('/users/profile');
  }
  next();
};

module.exports = { auth, loggedIn };
