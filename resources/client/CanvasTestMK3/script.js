function GetMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function UpdateWhiteboard(changes){
    console.log("Invoked updateWhiteboard");

    changes.forEach(function(change){
        console.log(change)
        if (change.delete) {

            whiteboard.beginPath();
            whiteboard.moveTo(change.startX, change.startY);
            whiteboard.lineTo(change.endX, change.endY);
            whiteboard.lineWidth = 3
            whiteboard.strokeStyle = "white";
            whiteboard.stroke();

        } else {

            whiteboard.beginPath();
            whiteboard.moveTo(change.startX, change.startY);
            whiteboard.lineTo(change.endX, change.endY);
            whiteboard.lineWidth = 1
            whiteboard.strokeStyle = change.color;
            whiteboard.stroke();

            whiteboardLines.push(change)
        }
    })

    for (var i = 0; i < whiteboardLines.length; i++) {
        if(whiteboardLines[i].delete){whiteboardLines.splice(i,1)}
    }

}

function KeyPress(key){
    console.log("Key press detected")
    switch(key){
        case "c":
            console.log("Attempting to clear")
            whiteboard.clearRect(0, 0, canvas.width, canvas.height);
            break;
        default:
            console.log("Invalid key")
    }


}

function GetServerLines(){
    console.log("Invoked getServerLines()");
    serverResponse = {timeToken: timeToken, serverChanges: [], preSnap: false};

    const url = "/line/get/";

    fetch(url + timeToken, {
        method: "GET",
    }).then(response => {
        console.log("firstresponse: ",response)
        return response.json();
    }).then(response => {
        if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
            alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
        } else {

            console.log(JSON.stringify(response))

            serverResponse = response;

            if (serverResponse.preSnap) {whiteboard.clearRect(0, 0, canvas.width, canvas.height); whiteboardLines = [];}

            for(i = 0; i < serverResponse.serverChanges.length; i++){
                serverResponse.serverChanges[i] = JSON.parse(serverResponse.serverChanges[i]);
            }

            UpdateWhiteboard(serverResponse.serverChanges)
            timeToken = serverResponse.timeToken
        }
    });
}

function ShouldSendServerUpdate(){

    if(clientChanges.length >= 20){
        return true
    } else {
        return false
    }
}

function SendServerUpdate(){

    //converting clientChanges to a string

    var ObjectStringClientChanges = []

    for(i = 0; i < clientChanges.length; i++){
        ObjectStringClientChanges.push(JSON.stringify(clientChanges[i]))
    }

    var StringClientChanges = ObjectStringClientChanges.toString()

    console.log(StringClientChanges + "1010")

    var url = "/line/add/";

    fetch(url + StringClientChanges, {method: "POST",})
        .then(response => {
            return response.json();})
        .then(response => {
            if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
            }
    });

}

function SendClientLines(change){
    clientChanges.push(change)
    if(ShouldSendServerUpdate()){
        SendServerUpdate(clientChanges) //      <------ API goes here
        clientChanges = []
    }
}

function ClearWhiteboard(){

    console.log("Clearing Whiteboard")

    for (var i = 0; i < whiteboardLines.length; i++) {
        whiteboardLines[i].delete = true
    }
    UpdateWhiteboard(whiteboardLines)
}

function Start(){

    window.clientChanges = [];
    window.whiteboardLines = [];
    window.timeToken = 0;
    window.lines = [];
    window.canvas = document.getElementById('myCanvas');
    window.whiteboard = canvas.getContext("2d");

    var pen = {
        drawing: false,
        position: {x:0,y:0},
        color: 'blue',
        newPoint: function(coord) {
            if(pen.drawing){
                changes = [{startX: this.position.x, startY: this.position.y, endX: coord.x, endY: coord.y, color: this.color, delete: false}]
                UpdateWhiteboard(changes)
                SendClientLines(changes[0])
            }
            this.position = coord;
        },
        penDown: function() {
            pen.drawing = true;
        },
        penUp: function() {
            pen.drawing = false;
        }
    }

    document.addEventListener('mousemove', function(event){pen.newPoint(GetMousePos(event))});
    document.addEventListener('mousedown', pen.penDown)
    document.addEventListener('mouseup', pen.penUp)
    document.addEventListener('keypress', function(event){KeyPress(event.key)});
    //window.setInterval(GetServerLines, 5000);

    //whiteboard buttons

    document.getElementById("redColorButton").onclick = function(){pen.color = "red"}
    document.getElementById("greenColorButton").onclick = function(){pen.color = "green"}
    document.getElementById("blueColorButton").onclick = function(){pen.color = "blue"}
    document.getElementById("clearWhiteboardButton").onclick = function(){ClearWhiteboard()}
    document.getElementById("updateButton").onclick = function(){GetServerLines()}

}