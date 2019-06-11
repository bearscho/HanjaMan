var os = require('os');
var admin = require("firebase-admin");
var serviceAccount = require("./loadman-c2e05-firebase-adminsdk-zneh0-e630263ce3.json");

var platfotm = "";
platfotm = os.platform();
//console.log(platfotm);
var hostip = "49.247.207.252";
if (platfotm == "win32") {
	 hostip = "127.0.0.1";
}

var munje_id = ""
console.log("%s-%s",platfotm,hostip);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://loadman-c2e05.firebaseio.com"
});
// Initialize Cloud Firestore through Firebase
var db = admin.firestore();
// Realtime change Event (문젝 바뀌면 업데이트--다른사람이 정답)
db.collection("naver_hana_nowmunje").doc("OnXQxdA84H5CYXjH6GBy")
    .onSnapshot(function(doc) {
        munje_id = doc.get("munje_id");
        console.log("onSnapshot - 현재 문제 ID => " + munje_id);

        snedBroadMsg("S2:"+ munje_id);   	//현재문제 ID
});

var WebSocketServer = require('websocket').server;
var http = require('http');

var clients = [];
// 임의로 ID부여하기 위함
var idlist = [];
var id = 0;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(3010, function() {
    console.log((new Date()) + ' Server is listening on port 3010');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {

    var connection = request.accept(null, request.origin);

    clients.push(connection);
    // 임의로 id값을 할당함. request.key값으로 client 구분
    idlist[request.key] = id++;

    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {

			var recvmsg = "";
	    recvmsg = message.utf8Data;
			var code = "";
	    var msg = "";
	    code = recvmsg.substring(0,2);
	    msg = recvmsg.substring(3);

        console.log('Received Message: ' + recvmsg);

				if(code == "C1") {
		      snedBroadMsg("S1:"+ "접속 환영!!!");   	//hello
					snedBroadMsg("S2:"+ munje_id);   	//현재문제 ID
		    } else if(code =="C2") {  //현재 문제 ID 응답
		     	snedBroadMsg("S2:"+ munje_id);   	//현재문제 ID
				} else if(code =="C3") {  //현재 문제 ID 에 대한하는 id,text 응답
						get_hanja_info(munje_id,function (res) {
						console.log(res);
						snedBroadMsg("S3:"+ JSON.stringify(res));   	//현재문제 ID
					}	);
				} else if(code =="C4") {  //다음 문제로 업데이트
					console.log("다음문제로 업데이트");

					get_munjeCnt(function (res) {
						console.log(res);
						get_nextMunje(res,function(res1) {
								console.log(res1);
								update_db_nextMunje(res1);
						});
					}	);
				} else if (code =="C9") {		//문제 추가하기...
					var obj;
		      obj = JSON.parse(msg)

					insert_munje(obj.hanja_id,obj.hanja_text,function(res) {
							console.log(res);
					});
				}
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function snedBroadMsg(msg) {
  clients.forEach(function(cli) {
      cli.sendUTF(msg);
  });
}


get_hanja_info = function(munje_id,callback) {
  console.log("get_hanja_info-",munje_id);
	var m_id = "";
	var m_text = "";

  var docRef = db.collection("naver_munje_list").doc(munje_id);
  docRef.get().then(function(doc) {
          if (doc.exists) {
              console.log("get_hanja_info Document data:", doc.data());
							callback(doc.data());
          } else {
              console.log("No such document!");
          }
  }).catch(function(error) {
          console.log("Error getting document:", error);
  });
}


get_munjeCnt = function(callback) {
	var MunjeListCount = 0;
	var munje_listsRef = db.collection("naver_munje_list");
	munje_listsRef.get().then(snap => {
		 MunjeListCount = snap.size // will return the collection size
		 console.log("전체 문제수 : ", MunjeListCount);
		 callback(MunjeListCount);
	});
}


get_nextMunje = function(cnt, callback) {
	MunjeListRandom = Math.floor((Math.random() * cnt));
  console.log(MunjeListRandom,"====",MunjeListRandom);
  //갯수 사이의 랜덤숫자 위치에 해당하는 Doc ID를 구함
  var NextMunjeID = "";

  var first = db.collection("naver_munje_list")
        .orderBy("hanja_id");

  first.get().then(function (documentSnapshots) {
    // Get the last visible document
    var lastVisible = documentSnapshots.docs[MunjeListRandom];
    console.log("다음 문제", lastVisible.id, lastVisible.data());
		callback(lastVisible.id);
	});
}

update_db_nextMunje = function (hanja_next_munje,callback) {
   console.log("다음문제 ",hanja_next_munje)

  var nowmunjeRef = db.collection("naver_hana_nowmunje").doc("OnXQxdA84H5CYXjH6GBy");
  nowmunjeRef.update({
      munje_id: hanja_next_munje
  })
  .then(function() {
      console.log("다음문제 Document successfully updated!");
  })
  .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
  });
}


insert_munje = function (h_id,h_text,callback) {
	var nowmunjeRef = db.collection("naver_munje_list").doc(h_id);

	nowmunjeRef.set(  {  hanja_id: h_id , hanja_text: h_text })
	.then(function() {
			console.log("munje_id Document successfully updated!");
	})
	.catch(function(error) {
			// The document probably doesn't exist.
			console.error("Error updating document: ", error);
	});

}
