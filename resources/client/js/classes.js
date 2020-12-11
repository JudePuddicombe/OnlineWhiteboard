class Whiteboard{ //manages events for the whiteboard (draw or clear) of the canvas

    constructor(c, s) {
        this.canvas = c;
        this.context = c.getContext("2d");
        this.server = s;
    }

    handleWhiteboardEvents(whiteboardEvents) {
        console.log("new Events " + whiteboardEvents);
        let thisWhiteboard = this;
        whiteboardEvents.forEach(function (whiteboardEvent){thisWhiteboard.handleWhiteboardEvent(whiteboardEvent)},thisWhiteboard);
    }

    draw(lineSegment) {

        console.log("Whiteboard.drawLineSegment"); //console.log for debugging

        //drawing the line (NOTE: The whole delete-tag system has been removed)

        this.context.beginPath();
        this.context.moveTo(lineSegment.startX, lineSegment.startY);
        this.context.lineTo(lineSegment.endX, lineSegment.endY);
        this.context.lineWidth = lineSegment.width;
        this.context.strokeStyle = lineSegment.color;
        this.context.stroke();
    }

    clear(){
        console.log("Clearing Whiteboard");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); //clear canvas
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
        this.server.putWhiteboardEvent(whiteboardEvent);
    }
}

class WhiteboardServer{ //contains all methods and attributes used when dealing with the server

    timeToken = 0;

    shouldSendClientChanges = true;

    clientEvents = [];

    clientForm;

    constructor() {
        this.clientForm = new FormData()
    }

    /*

    constructor(classroomId) {
        this.classroomId = classroomId
    }

     */

    getWhiteboardEvents(){ //in the future the classroom Id will be used to distinguish the different whiteboards

        console.log("Invoked Server.getWhiteboardEvents()"); //console.log for debugging

        let events = [];

        let promise = new Promise((resolve) => fetch("/whiteboardEvents/get/" + this.timeToken, {
            method: "GET", //method being used with the database
        }).then(response => { //api returns a promise
            return response.json(); //converting the response to JSON returns a promise
        }).then(serverResponse => {
            if (serverResponse.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                alert(JSON.stringify(serverResponse));    // if it does, convert JSON object to string and alert
            } else {
                this.timeToken = serverResponse.timeToken; //updates timetoken

                serverResponse.events.forEach(function (event) {events.push(JSON.parse(event))});

                console.log("New server events: ");
                console.log(events);

                resolve(events); //returns serverChanges
            }
        }));

        return promise
    }

    putWhiteboardEvent(clientWhiteboardEvent){

        console.log("Invoked Server.putWhiteboardEvents"); //console.log for debugging

        this.clientEvents.push(clientWhiteboardEvent); //add the JSON strings of the events to the list of evenst to go to the db
        this.actuallyPutWhiteboardEvents()
    }

    actuallyPutWhiteboardEvents(clientWhiteboardEvent){ //create a versatile api that sends whiteboard events (Line and Clear)

        console.log("Invoked Server.actuallyPutWhiteboardEvents"); //console.log for debugging

        if(!this.shouldSendClientChanges || this.clientEvents.length == 0){return}

        console.log("Actually RUNNING actuallyPutWhiteboardEvents");

        this.clientForm.set("clientEvents",JSON.stringify(this.clientEvents));

        console.log(this.clientForm);

        fetch("/whiteboardEvents/add/", {method: "POST" ,body: this.clientForm}) //converting array to string so it can be passed in the body
            .then(response => {
                return response.json();})
            .then(response => {
                if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                    console.log(JSON.stringify(response));    // if it does, convert JSON object to string and alert
                }
            });

        this.clientEvents = [];

        this.shouldSendClientChanges = false;

        let server = this; //so that the call back function knows what server to talk to when it's in the middle of nowhere
        setTimeout(function(){server.shouldSendClientChanges = true; server.actuallyPutWhiteboardEvents()},500,server) //unlocks the function after 500 milliseconds and checks to see if it should run again
    }
}

class Pen{ //generates drawing events for the whiteboard

    constructor(whiteboard) {
        this.whiteboard = whiteboard;
    }

    position = {x:0,y:0};

    drawing = false;

    color = "blue";

    width = 5;

    setColor(color){
        console.log("Setting color too: " + color);
        this.color = color;
    }

    down(){
        console.log("pen is down");
        this.drawing = true;
    }

    up(){
        console.log("pen is up");
        this.drawing = false;
    }

    moveTo(position){

        console.log("trying to move");

        if(this.drawing){

            console.log("trying to draw");

            let lineSegment;
            lineSegment = {startX: this.position.x, startY: this.position.y, endX: position.x, endY: position.y, color: this.color, width:this.width, type: "draw"}; //creating a lineSegment

            this.position = position; //moving the pen
            console.log("moved!");

            this.whiteboard.handleClientWhiteboardEvent(lineSegment); //handeling the new "event"
            console.log("and drawn!");

        } else {
            this.position = position; //moving the pen
            console.log("moved!");
        }
    }

    findPosition(event) {
        let rect = this.whiteboard.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}

class Chatboard{

    constructor(div,server) {
        this.server = server;
        this.div = div;
    }

    addChat(){
        console.log("moo");
        this.div.innerHTML = this.div.innerHTML + "<br/> newLine";
    }

}


class ChatroomServer{

}