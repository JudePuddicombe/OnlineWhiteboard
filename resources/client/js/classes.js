class Whiteboard{ //writes and manages all lines on the canvas, these come from the pen or directly from the db

    metaCanvas;

    canvas;

    server;

    constructor(metaCanvas,server) {
        this.metaCanvas = metaCanvas;
        this.canvas = metaCanvas.getContext("2d");
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

        this.canvas.clearRect(0, 0, this.canvas.width, this.canvas.height); //clear canvas
        this.server.clientWhiteboardEvents = [];//clear any events to be sent to the db
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

    handleClientWhiteboardEvent(whiteboardEvent){
        this.handleWhiteboardEvent(whiteboardEvent);
        // this.server.putWhiteboardEvent(whiteboardEvent);
    }
}

class Server{ //contains all functions used when dealing with the server;

    timeToken = 0;

    shouldSendClientChanges = true;

    clientWhiteboardEvents = [];

    constructor() {
    }

    /*

    constructor(classroomId) {
        this.classroomId = classroomId
    }

     */

    getWhiteboardEvents(){ //in the future the classroom Id will be used to distinguish the different whiteboards

        console.log("Invoked Server.getWhiteboardEvents()"); //console.log for debugging

        fetch("/whiteboardEvents/get/" + timeToken, {
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

    putWhiteboardEvent(clientWhiteboardEvent){

        console.log("Invoked Server.putWhiteboardEvents"); //console.log for debugging

        this.clientWhiteboardEvents.push(clientWhiteboardEvent);
        this.actuallyPutWhiteboardEvents()
    }

    actuallyPutWhiteboardEventsTimeOut(){
        this.shouldSendClientChanges = true;
        this.actuallyPutWhiteboardEvents()
    }

    actuallyPutWhiteboardEvents(){ //create a versatile api that sends whiteboard events (Line and Clear)

        console.log("Invoked Server.actuallyPutWhiteboardEvents"); //console.log for debugging

        if(!this.shouldSendClientChanges || !this.clientWhiteboardEvents){return} //defensive code

        fetch("/whiteboardEvents/add/", {method: "POST", body: this.clientWhiteboardEvents})
            .then(response => {
                return response.json();})
            .then(response => {
                if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                    alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
                }
            });

        this.clientWhiteboardEvents = [];

        this.shouldSendClientChanges = false;

        setTimeout(this.actuallyPutWhiteboardEventsTimeOut,500) //unlocks the function after 500 milliseconds and checks to see if it should run again
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
        console.log("pen is down");
        this.drawing = true;
        console.log(this.drawing)
    }

    up(){
        console.log("pen is up");
        this.drawing = false;
    }

    moveTo(position){

        console.log("again, trying to move");
        console.log(this.drawing);

        if(this.drawing){

            console.log("trying to draw");

            let lineSegment;
            lineSegment = {startX: this.position.x, startY: this.position.y, endX: position.x, endY: position.y, color: this.color, width:this.width, type: "draw"}; //creating a lineSegment

            this.position = position; //moving the pen
            console.log("moved!");

            whiteboard.handleClientWhiteboardEvent(lineSegment); //handeling the new "event"

        } else {
            this.position = position; //moving the pen
            console.log("moved!");
        }
    }

    findPosition(event) {
        let rect = this.whiteboard.metaCanvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}