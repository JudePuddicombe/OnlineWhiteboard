function submitClassroomId(){

    let inputClassroomId = document.getElementById("findClassroom").value;

    if(classroomIdNotValid(inputClassroomId)){
        console.log("Classroom Id Invalid: " + inputClassroomId);
        sayClassroomDoesNotExist();
        return;
    }

    let serverReadableClassroomId = makeClassroomIdServerReadable(inputClassroomId);

    if(classroomIdExists(serverReadableClassroomId)){
        goToClassroom(serverReadableClassroomId);
    } else {
        sayClassroomDoesNotExist();
    }
}

function classroomIdNotValid(classroomId){

    console.log(classroomId);

    if(classroomId.length != 6) {
        return true;
    }

    return false;
}

function classroomIdExists(classroomID){

    console.log("Invoked classroomIdQuery"); //console.log for debugging

    fetch("/classrooms/get/" + classroomID, {
        method: "GET", //method being used with the database
    }).then(response => { //api returns a promise
        return response.json(); //converting the response to JSON returns a promise
    }).then(serverResponse => {
        if (serverResponse.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
            alert(JSON.stringify(serverResponse));    // if it does, convert JSON object to string and alert
        } else {
            if(serverResponse.foundClassroomId){
                return true;
            } else {
                return false;
            }
        }
    });
}

function makeClassroomIdServerReadable(classroomId){
    return classroomId;
}

function goToClassroom(classroomId){
    localStorage.setItem("classroomId",classroomId);
    window.location.href = "http://localhost:8081/client/username.html";
}

function sayClassroomDoesNotExist() {
    alert("Classroom Id invalid")
}

function start(){
    document.getElementById("submitClassroom").onclick = function(){submitClassroomId()};
    document.getElementById("gotoLoginPage").onclick = function () {window.location.href = "http://localhost:8081/client/login.html";}
}
