function SubmitClassroomId(){

    let inputClassroomId = document.getElementById("findClassroom").value;

    if(ClassroomIdNotValid(inputClassroomId)){ //Chose to call function ClassroomIdNotValid so that the code reads better
        console.log("Classroom Id Invalid: " + inputClassroomId);
        SayClassroomDoesNotExist();
        return;
    }

    CheckClassroomId(inputClassroomId).then((classroomIdExists) => {
        if(classroomIdExists){
            GoToClassroom(inputClassroomId);
        }else{
            SayClassroomDoesNotExist();
        }
    })
}

function ClassroomIdNotValid(classroomId){

    console.log(classroomId);

    let validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if(classroomId.length != 9) {//Checking string is correct length
        return true;
    }

    console.log("1");

    if(classroomId.charAt(4) != "-"){//Checking for the separator
        return true;
    }

    console.log("2");

    for(let i = 0; i < 4; i++){//Checking first half of string contains only capital letters
        if(!validChars.includes(classroomId.charAt(i))){
            return true;
        }
    }

    console.log("3");

    for(let i = 5; i < 9; i++){ //Checking second half of string is only capital letters
        if(!validChars.includes(classroomId.charAt(i))){
            return true;
        }
    }

    console.log("4");

    return false; //If none of these return true then the string must be valid
}

function CheckClassroomId(classroomID){

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

function GoToClassroom(classroomId){
    localStorage.setItem("classroomId",classroomId);
    window.location.href = "http://localhost:8081/client/username.html";
}

function SayClassroomDoesNotExist(){
    console.log("Classroom Id invalid");
    alert("Classroom Id invalid");
}

function CreateClassroom(){

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

function Start(){
    document.getElementById("submitClassroom").onclick = function(){SubmitClassroomId()};
    document.getElementById("createClassroom").onclick = function () {CreateClassroom()}
}
