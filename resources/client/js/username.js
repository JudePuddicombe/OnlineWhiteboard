function submitUsername(){
    let temporaryUsername = document.getElementById("temporaryUsername").value;
}

function start(){
    document.getElementById("submitButton").onclick = function () {submitUsername()}
}