var awsIot = require('aws-iot-device-sdk');
var AWS = require('aws-sdk');
var fs = require('fs');
var s3 = new AWS.S3({
  accessKeyId : "...",
  secretAccessKey : "...",
  region : 'ap-northeast-2'
});

var doorCamera = awsIot.device({
  keyPath: "./credentials/camera/...",
  certPath: "./credentials/camera/...",
  caPath: "./credentials/camera/AmazonRootCA1.pem",
  clientId: "doorCamera1",
  host: "..."
});

var image_keys = ['DD.jpg','MM.jpg','TH.jpg','MS.jpg','BC.jpg'];

var bucket_params = {
  Bucket:'face-bucket-hw',
  Key:'',
  Body:''
};

doorCamera.on('connect', function () {
  console.log('** Door Camera가 실행중입니다 **');

  // 카메라가 연결되면 업로드
  // key 배열을 돌면서 각 이미지를 S3에 업로드
  for (var i=0;i<image_keys.length;i++){
    const fileContent = fs.readFileSync('./face_images/'+image_keys[i]);

    bucket_params['Key'] = image_keys[i];
    bucket_params['Body']=fileContent;

    //s3에 사진 파일 업로드
    s3.upload(bucket_params, function(err,data){
      // console.log(err);
      // console.log(data);
    });
  }
  // console.log('사진 업로드 완료');

  //사진 업로드 후 recognittion lambda service - topic publish
  setInterval(function () {
    // 0~4 까지 랜덤 idx 생성
    var idx = Math.ceil(Math.random() * 4);
    
    var message = { 'notify': 'faceRecog/notify/door1', 'image': image_keys[idx] };
    console.log('faceRecog/request에 PUBLISH 합니다' + JSON.stringify(message));
    doorCamera.publish('faceRecog/request', JSON.stringify(message));
  }, 3000);
});
