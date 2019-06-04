const request = require('request');
var express = require('express');
var path = require('path');
var os = require('os');

var app = express();

//console.log(os.type()); // "Windows_NT"
//console.log(os.release()); // "10.0.14393"
//console.log(os.platform()); // "win32"
var platfotm = "";
platfotm = os.platform();
//console.log(platfotm);
var pathformat = "/";
if (platfotm == "win32") {
	pathformat = "\\";
} 

console.log("%s-%s",platfotm,pathformat);
 
app.get('/get_naver_dics', function (req, res) {
	var hanja_id = req.query.hanja_id;
	console.log(hanja_id);
	const options = {
	  uri: "https://us-central1-loadman-c2e05.cloudfunctions.net/get_naver_dics?hanja_id=" + hanja_id	 
	};
	request(options,function(err,response,body){
	  //console.log(uri);
	  res.send(body);
	})
  //res.send('body');
});


//정적파일..   windows   \\   linux /   pathformat
app.get('/',function(req,res) {	
  res.sendFile(path.join(__dirname+ pathformat + 'index_intro.html'));
});
app.get('/index_intro.html',function(req,res) {	
  res.sendFile(path.join(__dirname+ pathformat + 'index_intro.html'));
});
app.get('/munje_v15.html',function(req,res) {	
  res.sendFile(ath.join(__dirname+ pathformat + 'munje_v15.html'));
});

 
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
 
  console.log('앱은 http://%s:%s 에서 작동 중입니다.', host, port);
});


