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

        snedBroadMsg("" + munje_id);
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

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}


wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept(null, request.origin);

    clients.push(connection);
    // 임의로 id값을 할당함. request.key값으로 client 구분
    idlist[request.key] = id++;

    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
                     // 브로드캐스팅!!
            snedBroadMsg( message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
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
