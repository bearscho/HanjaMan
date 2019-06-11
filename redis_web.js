const request = require('request');
var express = require('express');
var bodyParser     =        require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

var redis = require('redis');
client = redis.createClient(6379,'127.0.0.1');

client.on('error',function (err) {
	console.log('Error ' + err);
});


app.get('/get_redis_hanja',function(req,res){
  var hanja_id=req.query.hanja_id;
  console.log("hanja_id  = "+hanja_id);
	client.get(hanja_id , function (err, value) {
		if (err) throw err;
		console.log(hanja_id + '-:-' + value);
		res.end(value);
	});
});

app.post('/set_redis_hanja',function(req,res){
	console.log("aaaaaaaaaaaaaa ");
  var hanja_id=req.body.hanja_id;
  var hanja_html=req.body.hanja_html;
  console.log("hanja_id = "+hanja_id+", hanja_html is "+hanja_html);
	client.set(hanja_id,hanja_html,redis.print);
  res.end(hanja_id);
});


var server = app.listen(3020, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('앱은 http://%s:%s 에서 작동 중입니다.', host, port);
});
