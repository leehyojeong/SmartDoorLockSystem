## SmartDoorLockSystem

### 프로그램 설명
- 가상의 사물로 door Camera와 door Lock을 생성하여 인증된 사람에게만 문이 열리는 프로그램을 구현했다.
- 인증된 사람의 목록은 S3에 이미지 객체로 올려놓는다. 
- 사람이 방문한 상황을 door Camera에 1장의 사람 이미지가 업로드 되는 방식으로 구현한다.
- 이미지 업로드와 동시에 이미지가 등록되었다는 내용의 메세지를 faceRecog/request 토픽에 publish한다.
- faceRecog/request에 메세지가 publish되면 IoT Rule의 SELECT Clause를 트리거로 사용하여 람다 함수가 실행되도록 만든다.
- 람다 함수는 Rekognition을 실행하여 새로 업로드 된 이미지와 기존에 등록되어 있던 이미지들을 비교한다. 
- 비교 결과는 door Lock의 해제 여부 내용으로 메세지를 작성하여 faceRecog/notify/door1 토픽에 publish한다. 
- door Lock은 해당 토픽을 subscribe하고 있다가 메세지가 도착하면 인증된 사람에게만 문을 열어준다.

### 프로그램 구조도
![image](https://user-images.githubusercontent.com/39904216/90132212-5d6ead00-dda8-11ea-9c4f-836ce13b1b0a.png)

### System Implementation
- Image DB
  - S3에 이미지 객체를 업로드 함으로써 인증된 사람 배열을 관리한다.
  - Rekognition에 인자로 넘겨줄 때에는 인증된 사람 배열 원소를 S3 이미지 Key값으로 사용하여 객체를 가져온다.
- doorCamera1.js(IoT Applications)
  - door1에 방문한 사람의 얼굴 사진을 S3에 업로드하는 역할이다.
  - 방문한 사람의 정보를 ```{'notify':'faceRecog/notify/door1', 'image':''}``` 형태로 "faceRecog/request" 토픽에 publish한다.
  - 연결된 IoT Rule을 통해 "faceRecognitionLambdaService" 람다 함수를 실행한다.
- doorLock1.js(IoT Applications)
  - "faceRecog/notify/door1" 토픽을 subscribe한다.
  - 도착한 메세지의 command가 "unlock"인 경우 door1을 열었다는 내용을 출력한다.
  - 도착한 메세지의 commnad가 "reject"인 경우 인증디지 않은 사람이라는 내용을 출력한다.
- IoT Rules (SQL SELECT Clause)
  - "faceRecog/request" 토픽을 subscribe한다.
  - 위의 토픽으로 메세지가 도착하면 "faceRecognitionLambdaServie" 람다 함수를 실행한다.
  - 직접 실행한다기 보다는 람다 함수를 트리거로 등록하여 자동 실행이 되도록 만들어 놓는 것과 같다.
  
  ![image](https://user-images.githubusercontent.com/39904216/90134185-bc81f100-ddab-11ea-90ce-7822dd2641ee.png)
- Face Recognition Lambda Service
  - AWS Lambda에서 nodejs로 구현했다.
  - S3, IoT, Rekognition의 모든 기능, 리소스에 접근할 수 있는 권한을 부여해야 한다.
  - 인증되어 있는 사람의 Key 값 배열로 "unlockList"를 선언했다.
  - 등록된 사람과 일치하는 이름을 가진 경우에만 door가 열리도록 구현했다.
  - Rekognition은 유사도(similarity)가 90% 이상인 경우에만 출력되도록 설정해두었다.
  - 인증된 사람 배열을 도는 중 일치하는 사람이 있는 경우 "faceRecog/notify/door1" 토픽에 ```{'image':'','command':'unlock'}```을 publish한다.
  - 배열을 다 돌아도 일치하는 사람이 없는 경우 "faceRecog/notify/door1" 토픽에 ```{'image':'','command':'reject'}```를 publish한다.

### 실행 결과
- doorCamera1.js

![image](https://user-images.githubusercontent.com/39904216/90134605-62cdf680-ddac-11ea-89b0-f23e231f3f13.png)

- doorLock1.js

![image](https://user-images.githubusercontent.com/39904216/90134649-711c1280-ddac-11ea-9cc7-8326599ead83.png)
