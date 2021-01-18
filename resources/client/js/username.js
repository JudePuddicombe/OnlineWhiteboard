function SubmitUsername(){

    let temporaryUsername = document.getElementById("temporaryUsername").value;

    if(TemporaryUsernameIsNotValid(temporaryUsername)){
        console.log("Invalid Username")
        return;
    }

    localStorage.setItem("username",temporaryUsername);

    let myId = GenerateProbablyUniqueId()

    console.log(myId);

    localStorage.setItem("userId",myId);
    window.location.href = "http://localhost:8081/client/classroom.html";

}

function TemporaryUsernameIsNotValid(temporaryUsername) {

    if(temporaryUsername == ""){
        return true;
    }

    if(!(temporaryUsername.length < 16)){
        alert("Username must be less than 16 characters");
        return true;
    }

    let validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefjhijklmnopqrstuvwxyz1234567890-_";

    for(let i = 0; i < temporaryUsername.length; i++){//Checking the temporary username for validity
        if(!validChars.includes(temporaryUsername.charAt(i))){
            alert("Username cannot contain: " + temporaryUsername.charAt(i));
            return true;
        }
    }

    return false;
}

function GenerateProbablyUniqueId(){

    return Math.random().toString().substring(2); //generates an 16 character long random string (of digits)

}

function Start(){
    document.getElementById("submitClassroom").onclick = function () {SubmitUsername()}
}