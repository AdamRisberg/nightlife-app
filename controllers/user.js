function get(req, res) {
  res.send("User Page");
}

function register(req, res) {

}

function login(req, res) {

}

function logout(req, res) {
  res.send("Logout");
}

module.exports = {
  get,
  register,
  login,
  logout
};