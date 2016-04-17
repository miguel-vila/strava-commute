var fs = require('fs');
var express = require('express');
var strava = require('strava-v3');
var promisify = require("promisify-node");
var bodyParser = require('body-parser');
var getToken = promisify(strava.oauth.getToken);
var getActivities = promisify(strava.athlete.listActivities);

var app = express();
app.use(bodyParser.json());

app.post('/my-commutes', function (req, res) {
  var code = req.body && req.body.code;
  if(!code) {
    res.status(404)
       .json({ msg: 'Must send json with "code" field' })
  } else {
    getToken(code).then(function(response){
      console.log(response);
    });
    res.json({ok:true});
  }
});

app.get('/', function (req, res) {
  var path = __dirname + '/index.html';
  var stat = fs.statSync(path);
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=0');
  res.setHeader('Content-Length', stat.size);
  var stream = fs.createReadStream(path);
  stream.pipe(res);
});

app.use('/dist', express.static(__dirname + '/dist'));
app.use('/img', express.static(__dirname + '/img'));

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
