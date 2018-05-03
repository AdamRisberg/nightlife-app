function index(req, res) {
  res.render("index", {
    loggedIn: (req.user ? "1" : ""),
    username: req.user ? req.user.username : "" 
  });
}

function loginForm(req, res) {
  res.render("signin");
}

function registerForm(req, res) {
  res.render("register");
}

function register(req, res) {
  res.redirect("/");
}

function login(req, res) {
  res.redirect("/");
}

function logout(req, res) {
  req.logout();
  res.redirect("/");
}

function checkLoggedIn(req, res) {
  var userId = req.user && req.user._id.toString();
  var username = req.user && req.user.username;

  res.json({ loggedIn: !!userId, username: username });
}

module.exports = {
  index,
  loginForm,
  registerForm,
  register,
  login,
  logout,
  checkLoggedIn
};