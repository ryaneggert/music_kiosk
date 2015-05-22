// Main page.

var path = require('path');
main = {};

main.main = function(req, res) {
  console.log(req.session.user);
  res.sendFile('/pages/index.html', {
    root: path.join(__dirname, '../public')
  });
};

module.exports = main;
