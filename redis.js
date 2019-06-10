var redis = require('redis');
client = redis.createClient(6379,'49.247.207.252');

client.on('error',function (err) {
        console.log('Error ' + err);
});

client.set('1223','red',redis.print);

client.get('1223' , function (err, value) {
        if (err) throw err;
        console.log('1223:' + value);
});
