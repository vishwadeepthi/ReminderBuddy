var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});


// router.post('/configure', function(req, res) {
//   console.log(req.body);
//   res.json({
//     "success" : true
//   });
// });
module.exports = router;