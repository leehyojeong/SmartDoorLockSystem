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


