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

	// 1. Redis 에 있는지 확인....
  // 있으면, Redis 의 값으로 return;

	const options1 = {
	  uri: "http://49.247.207.252:3020/get_redis_hanja?hanja_id=" + hanja_id
	};
	request(options1,function(err,response,body){
		console.log("redis return ::: ");
	  console.log(body);

		if (body == "null" || body == "") {		// 없는 경우
			console.log("null------" + body);
			//cloudfunctions 으로 naver연동된 값을 가져옴
			getNaverDics(hanja_id,function(r1) {
				//console.log(r1);
				setRedisHanja(hanja_id,r1,function(r2) {
					//console.log(r2);

					res.send(r1);
				})
			}
		)

		} else {		// 있는 경우
			//console.log("exists ------" + body);
			res.send(body);
		}
	  //res.send(body);
	})

	//2.
	/*
	const options2 = {
		uri: "https://us-central1-loadman-c2e05.cloudfunctions.net/get_naver_dics?hanja_id=" + hanja_id
	};
	request(options2,function(err,response,body){
		console.log(body);
		//res.send(body);
	})
	*/
});

getNaverDics = function(hanja_id,callback) {
	console.log("getNaverDics Call:" + hanja_id);
	const options2 = {
		uri: "https://us-central1-loadman-c2e05.cloudfunctions.net/get_naver_dics?hanja_id=" + hanja_id
	};
	request(options2,function(err,response,body){
		//console.log(body);
		callback(body);
	})
}

setRedisHanja = function(hanja_id,hanja_html,callback) {
	console.log("setRedisHanja Call:" + hanja_id);

	let options2 = {
	    url: 'http://49.247.207.252:3020/set_redis_hanja',
	    form: {
	        hanja_id: hanja_id,
	        hanja_html: hanja_html
	    }
	};

	request.post(options2, function(err,response,body){
		//console.log(body);
		callback(body);
	});
}




//정적파일..   windows   \\   linux /   pathformat
app.get('/',function(req,res) {
  res.sendFile(path.join(__dirname+ pathformat + 'index_intro.html'));
});
app.get('/index_intro.html',function(req,res) {
  res.sendFile(path.join(__dirname+ pathformat + 'index_intro.html'));
});
app.get('/munje_v16.html',function(req,res) {
  res.sendFile(path.join(__dirname+ pathformat + 'munje_v16.html'));
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('앱은 http://%s:%s 에서 작동 중입니다.', host, port);
});
