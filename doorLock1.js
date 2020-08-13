var awsIot = require('aws-iot-device-sdk');

var doorLock = awsIot.device({
  keyPath: "./credentials/lock/...",
  certPath: "./credentials/lock/...",
  caPath: "./credentials/lock/AmazonRootCA1.pem",
  clientId: "doorLock1",
  host: "..."
});

doorLock.on('connect', function () {
  console.log('** Door Lock에 연결되었습니다 **');
  doorLock.subscribe('faceRecog/notify/door1', function () {
    console.log('faceRecog/notify/door1을 SUBSCRIBE 중입니다');
  });

  doorLock.on('message', function (topic, message) {
    if (topic == 'faceRecog/notify/door1') {
      var noti = JSON.parse(message.toString());
      if (noti.command == 'unlock') {
        console.log(noti.image, ': door1을 열었습니다.')
      }
      else if(noti.command =='reject') {
        console.log(noti.image, ': 인증되지 않은 사람입니다.')
      }
    }
  })
});
