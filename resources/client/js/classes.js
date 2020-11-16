class Whiteboard{ //writes and manages all lines on the canvas, these come from the pen or directly from the db

    canvas;

    server;

    constructor(canvas,server) {
        this.canvas = canvas;
        this.server = server;
    }

    handleWhiteboardEvents(whiteboardEvents) {
        whiteboardEvents.forEach(this.handleWhiteboardEvent(whiteboardEvent))
    }

    draw(lineSegment) {

        console.log("Whiteboard.drawLineSegment"); //console.log for debugging

        //drawing the line (NOTE: The whole delete-tag system has been removed)

        this.canvas.beginPath();
        this.canvas.moveTo(lineSegment.startX, lineSegment.startY);
        this.canvas.lineTo(lineSegment.endX, lineSegment.endY);
        this.canvas.lineWidth = lineSegment.width;
        this.canvas.strokeStyle = lineSegment.color;
        this.canvas.stroke();
    }

    clear(){
        console.log("Clearing Whiteboard");

        this.canvas.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
        this.server.clientChanges = [];//clear any events to be sent to the db
    }

    handleWhiteboardEvent(whiteboardEvent){
        switch(whiteboardEvent.type){
            case "draw":
                this.draw(whiteboardEvent);
                break;
            case "clear":
                this.clear();
                break;
            default:
                break;
        }
    }

    findPosition(event) {
        let rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    handleClientChange(clientChange){
        this.handleWhiteboardEvent(clientChange);
        this.server.putWhiteboardEvent(clientChange);
    }
}

class Server{ //contains all functions used when dealing with the server

    clientChanges;

    timeToken = 0;

    shouldSendClientChanges = true;

    constructor(classroomId) {
        this.classroomId = classroomId
    }

    getWhiteboardLogs(){ //in the future the classroom Id will be used to distinguish the different whiteboards

        console.log("Invoked Server.getLines()"); //console.log for debugging

        fetch("/whiteboardLog/get/" + timeToken, {
            method: "GET", //method being used with the database
        }).then(response => { //api returns a promise
            return response.json(); //converting the response to JSON returns a promise
        }).then(serverResponse => {
            if (serverResponse.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                alert(JSON.stringify(serverResponse));    // if it does, convert JSON object to string and alert
            } else {
                this.timeToken = serverResponse.timeToken //updates timetoken
                return serverResponse.serverChanges //returns serverChanges
            }
        });
    }

    putWhiteboardEvent(clientChange){
        this.clientChanges.put(clientChange);
        this.actuallyPutWhiteboardEvent()
    }

    actuallyPutWhiteboardEvent(){ //create a versatile api that sends whiteboard events (Line and Clear)

        if(!this.shouldSendClientChanges || !this.clientChanges){return} //defensive code

        fetch("/whiteboardLog/add/", {method: "POST", body: this.clientChanges})
            .then(response => {
                return response.json();})
            .then(response => {
                if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                    alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
                }
            });

        this.clientChanges = [];

        this.shouldSendClientChanges = false;

        setTimeout(function (){this.shouldSendClientChanges = true; this.actuallyPutWhiteboardEvent()},500) //unlocks the function after 500 milliseconds and checks to see if it should run again
    }
}

class Pen{ //deals with the cursor moving and drawing on the canvas

    constructor(whiteboard) {
        this.whiteboard = whiteboard;
    }

    position = {x:0,y:0};

    drawing = false;

    color = "blue";

    width = 1;

    down(){
        this.drawing = true;
    }

    up(){
        this.drawing = false;
    }

    moveTo(position){

        if(this.drawing){

            let lineSegment
            lineSegment = {startX: this.position.x, startY: this.position.y, endX: position.x, endY: position.y, color: this.color, type: "draw"}; //creating a lineSegment

            this.position = position; //moving the pen

            whiteboard.handleClientChange(lineSegment); //handeling the new event

        } else {
            this.position = position; //moving the pen
        }
    }
}