function submitClassroomId(){

    let inputClassroomId = document.getElementById("findClassroom").value;

    if(classroomIdNotValid(inputClassroomId)){
        console.log("Classroom Id Invalid: " + inputClassroomId);
        sayClassroomDoesNotExist();
        return;
    }

    let serverReadableClassroomId = makeClassroomIdServerReadable(inputClassroomId);

    checkClassroomId(serverReadableClassroomId).then((classroomIdExists) => {
        if(classroomIdExists){
            goToClassroom(serverReadableClassroomId);
        }else{
            sayClassroomDoesNotExist();
        }
    })
}

function classroomIdNotValid(classroomId){

    console.log(classroomId);

    //if(classroomId.length != 5) {
    //    return true;
    //}

    return false;
}

function checkClassroomId(classroomID){

    console.log("Invoked classroomIdQuery"); //console.log for debugging

    let promise = new Promise((resolve) => fetch("/classrooms/check/" + classroomID, {
        method: "GET", //method being used with the database
    }).then(response => { //api returns a promise
        return response.json(); //converting the response to JSON returns a promise
    }).then(serverResponse => {
        if (serverResponse.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
            alert(JSON.stringify(serverResponse));    // if it does, convert JSON object to string and alert
        } else {

            if(serverResponse.classroomIsFound){
                console.log("Classroom found!");
                resolve(true);
            } else {
                console.log(serverResponse);
                resolve(false);
            }
        }
    }));

    return promise;
}

function makeClassroomIdServerReadable(classroomId){
    return classroomId;
}

function goToClassroom(classroomId){
    localStorage.setItem("classroomId",classroomId);
    window.location.href = "http://localhost:8081/client/username.html";
}

function sayClassroomDoesNotExist(){
    console.log("Classroom Id invalid");
    alert("Classroom Id invalid");
}

function createClassroom(){

    fetch("/classrooms/create/", {
        method: "GET", //method being used with the database
    }).then(response => { //api returns a promise
        return response.json(); //converting the response to JSON returns a promise
    }).then(serverResponse => {
        if (serverResponse.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
            alert(JSON.stringify(serverResponse));    // if it does, convert JSON object to string and alert
        } else {
            localStorage.setItem("classroomId",serverResponse.classroomId)
            window.location.href = "http://localhost:8081/client/username.html";
        }
    })
}

function start(){
    document.getElementById("submitClassroom").onclick = function(){submitClassroomId()};
    document.getElementById("createClassroom").onclick = function () {createClassroom()}
}
