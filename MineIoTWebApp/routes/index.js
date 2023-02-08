var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  devicesCount = 22;
  chartsCount = 0;
  headers = req.headers;
  
  res.render('index', { title: 'MineIOT', devicesCount: devicesCount, chartsCount: chartsCount, headers: headers});
});

/* POST home page. */
router.post('/post-form', function(req, res, next) {
  res.res('Hello');
});

module.exports = router;
