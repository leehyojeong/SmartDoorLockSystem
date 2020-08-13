const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const iot = new AWS.IotData({
    endpoint:'...'
});
const bucket = 'face-bucket-hw';

exports.handler = async (event, context) => {
    var cnt=0;
    var photo_source = event.image;
    
    //인증된 사람 목록
    var unlockList = ['DaneDehaan.jpg','MadsMikkelsen.jpg','ThomasHardy.jpg'];

    const rekog = new AWS.Rekognition();
    
    for(var i=0;i<unlockList.length;i++){
        
        const params = {
            SourceImage:{
                S3Object:{
                    Bucket:bucket,
                    Name:photo_source
                }
            },
            TargetImage:{
                S3Object:{
                    Bucket:bucket,
                    Name:unlockList[i]
                }
            },
            SimilarityThreshold: 90
        };
        
        //rekognition 실행
        const res = await rekog.compareFaces(params, function(err, response){
           if(err){
               console.log(err,err.stack);
           } 
           else{
               if(response.FaceMatches.length){
                    return true;
               }
               else{
                   return false;
               }
           }
        }).promise();
        
        if(res.FaceMatches.length==0){
            //일치하지 않는 사람인 경우
            cnt++;
        }
        
        else if(res.FaceMatches.length!=0){
            //일치하는 사람인 경우
            var param2 = {
                topic:'faceRecog/notify/door1',
                payload:JSON.stringify({'image':event.image,'command':'unlock'}),
                qos:0
            }
            iot.publish(param2, function(err,data){
                if(err){
                    console.log(err);
                    return context.fail(err);
                }
                else{
                    // console.log(data);
                    return context.succeed('** DOOR UNLOCK **');
                }
            });
        }
        
        if(cnt==unlockList.length){
            var param = {
                topic:'faceRecog/notify/door1',
                payload:JSON.stringify({'image':event.image,'command':'reject'}),
                qos:0
            }
            iot.publish(param,function(err, data){
                if(err){
                    console.log(err);
                    return context.fail(err);
                }
                else{
                    console.log(data);
                    return context.succeed('** REJECTED **');
                }
            });
        }
        
    }
}
