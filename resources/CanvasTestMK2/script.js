function GetMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function RemoveObjectByObject(objectArray,object){

    objectString = JSON.stringify(object)

    for (var i = 0; i < objectArray.length; i++) {
        if(objectString == JSON.stringify(objectArray[i])){
            delete objectArray[i]
        }
    }

}

function UpdateWhiteboard(changes){

    for (var i = 0; i < changes.length; i++) {

        if (changes[i].delete) {

            whiteboard.beginPath();
            whiteboard.moveTo(changes[i].startX, changes[i].startY);
            whiteboard.lineTo(changes[i].endX, changes[i].endY);
            whiteboard.lineWidth = 3
            whiteboard.strokeStyle = "white";
            whiteboard.stroke();

            RemoveObjectByObject(whiteboardLines,changes[i])

        } else {

            whiteboard.beginPath();
            whiteboard.moveTo(changes[i].startX, changes[i].startY);
            whiteboard.lineTo(changes[i].endX, changes[i].endY);

            whiteboard.strokeStyle = changes[i].color;
            whiteboard.stroke();

            whiteboardLines.push(changes[i])
        }
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
            // something here
    }


}

function GetServerLines(){

    databaseResponse = {timeToken: timeToken, serverChanges: [], preSnap: false};

    databaseResponse = GetServerUpdate(databaseResponse.timeToken); //   <------ API goes here

    if (databaseResponse.preSnap) {whiteboard.clearRect(0, 0, canvas.width, canvas.height)}
    UpdateWhiteboard(databaseResponse.serverChanges)
    timeToken = databaseResponse.timeToken

}

function ShouldSendClientChanges(){

    if(clientChanges.length >= 20){
        return true
    } else {
        return false
    }
}

function SendClientLines(change){
    clientChanges.push(change)
    if(ShouldSendClientChanges()){
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
    whiteboardLines = []
}

function Start(){

    window.clientChanges = [];
    window.whiteboardLines = [];
    window.timeToken = null;
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
                // SendClientLines(changes[0])
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
    // window.setInterval(GetServerLines, 5000);

    //whiteboard buttons

    document.getElementById("redColorButton").onclick = function(){pen.color = "red"}
    document.getElementById("greenColorButton").onclick = function(){pen.color = "green"}
    document.getElementById("blueColorButton").onclick = function(){pen.color = "blue"}
    document.getElementById("clearWhiteboardButton").onclick = function(){ClearWhiteboard()}

}