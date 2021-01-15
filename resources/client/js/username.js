function submitUsername(){

    let temporaryUsername = document.getElementById("temporaryUsername").value;

    if(temporaryUsernameIsNotValid(temporaryUsername)){
        console.log("Invalid Username")
        return;
    }

    localStorage.setItem("username",temporaryUsername);

    let myId = generateProbablyUniqueId()

    console.log(myId);

    localStorage.setItem("userId",myId);
    window.location.href = "http://localhost:8081/client/classroom.html";

}

function temporaryUsernameIsNotValid(temporaryUsername) {

    if(temporaryUsername == ""){
        return true;
    }

    return false;
}

function generateProbablyUniqueId(){

    return Math.random().toString().substring(2); //generates an 16 character long random string (of digits)

}

function start(){
    document.getElementById("submitClassroom").onclick = function () {submitUsername()}
}