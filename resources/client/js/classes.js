//whiteboard stuff

class Whiteboard{ //manages events for the whiteboard (draw or clear) of the canvas

    constructor(c, s) {
        this.canvas = c;
        this.context = c.getContext("2d");
        this.server = s;

        this.rect = this.canvas.getBoundingClientRect();

        this.canvas.width = this.rect.width;
        this.canvas.height = this.rect.height;
    }

    handleWhiteboardEvents(whiteboardEvents) {
        console.log("new Events " + whiteboardEvents);
        let thisWhiteboard = this;
        whiteboardEvents.forEach(function (whiteboardEvent){thisWhiteboard.handleWhiteboardEvent(whiteboardEvent)},thisWhiteboard);
    }

    draw(lineSegment) {

        let startX = lineSegment.relativeStartX*this.canvas.width;
        let endX = lineSegment.relativeEndX*this.canvas.width;

        let startY = lineSegment.relativeStartY*this.canvas.height;
        let endY = lineSegment.relativeEndY*this.canvas.height;

        console.log("Whiteboard.drawLineSegment"); //console.log for debugging
        console.log(lineSegment);

        //drawing the line (NOTE: The whole delete-tag system has been removed)

        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, endY);
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

}

class WhiteboardServer{ //contains all methods and attributes used when dealing with the server

    timeToken = 0;

    shouldSendClientChanges = true;

    clientEvents = [];

    clientForm = new FormData();

    constructor(classroomID) {
        this.classroomID = classroomID;
    }

    getWhiteboardEvents(){ //in the future the classroom Id will be used to distinguish the different whiteboards

        console.log("Invoked Server.getWhiteboardEvents()"); //console.log for debugging

        let events = [];

        let promise = new Promise((resolve) => fetch("/whiteboardEvents/get/" + this.classroomID + "/" + this.timeToken, {
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

        fetch("/whiteboardEvents/add/" + this.classroomID, {method: "POST" ,body: this.clientForm}) //converting array to string so it can be passed in the body
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

    constructor(whiteboard,server) {
        this.whiteboard = whiteboard;
        this.server = server;
    }

    position = {relativeX:0,relativeY:0};

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

    moveTo(newPosition){

        console.log("trying to move");

        if(this.drawing){

            this.draw(newPosition);

        } else {

            this.position = newPosition; //moving the pen
            console.log("moved!");

        }
    }

    findPosition(event) {
        return {
            relativeX: (event.clientX - this.whiteboard.rect.left)/this.whiteboard.canvas.width,
            relativeY: (event.clientY - this.whiteboard.rect.top)/this.whiteboard.canvas.height
        };
    }

    draw(newPosition){

        console.log("trying to draw");

        let lineSegment;
        lineSegment = {relativeStartX: this.position.relativeX, relativeStartY: this.position.relativeY, relativeEndX: newPosition.relativeX, relativeEndY: newPosition.relativeY, color: this.color, width:this.width, type: "draw"}; //creating a lineSegment

        console.log(lineSegment);

        this.position = newPosition; //moving the pen
        console.log("moved!");

        this.whiteboard.handleWhiteboardEvent(lineSegment); //handeling the new "event"
        this.server.putWhiteboardEvent(lineSegment); // sends to db

        console.log("and drawn!");

    }

    clear(){

        let clearEvent = {type: "clear"};
        this.whiteboard.handleWhiteboardEvent(clearEvent);
        this.server.putWhiteboardEvent(clearEvent);

    }
}

//chatboard stuff

class Chatboard{

    constructor(chatboard,server,user) {
        this.server = server;
        this.chatboard = chatboard;
        this.user = user;
    }

    addChats(chats){
        console.log("new Events " + chats);
        let thisChatboard = this;
        chats.forEach(function(chat){thisChatboard.addChat(chat)},thisChatboard)
    }

    addChat(chat){

        let body = chat.body;
        let username = chat.username;
        let userId = chat.userId;
        let output;

        if(userId == this.user.id){

            output = "<div class = 'chatboardTextYou'>(You)</br>" + body + "</div>"

        } else {

            output = "<div class = 'chatboardTextOther'>(" + username + ")</br>" + body + "</div>"

        }

        this.chatboard.innerHTML = this.chatboard.innerHTML + output;

    }

}

class ChatboardServer{ //generates chats gathered from the server and sends chats to the server

    timeToken = 0;

    clientForm = new FormData()

    constructor(classroomID) {
        this.classroomID = classroomID;
    }

    putChat(chat){

        this.clientForm.set("chat",JSON.stringify(chat));

        console.log(this.clientForm);

        fetch("/chatboardChats/add/" + this.classroomID, {method: "POST" ,body: this.clientForm})
            .then(response => {
                return response.json();})
            .then(response => {
                if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                    console.log(JSON.stringify(response));    // if it does, convert JSON object to string and alert
                }
            });
    }

    getChats(){

        console.log("Invoked Server.getChats()"); //console.log for debugging

        let chats = [];

        let promise = new Promise((resolve) => fetch("/chatboardChats/get/" + this.classroomID + "/" + this.timeToken, {
            method: "GET", //method being used with the database
        }).then(response => { //api returns a promise
            return response.json(); //converting the response to JSON returns a promise
        }).then(serverResponse => {
            if (serverResponse.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                alert(JSON.stringify(serverResponse));    // if it does, convert JSON object to string and alert
            } else {
                this.timeToken = serverResponse.timeToken; //updates timetoken

                serverResponse.chats.forEach(function (chat) {chats.push(JSON.parse(chat))});

                console.log("New server chats: ");
                console.log(chats);

                resolve(chats); //returns serverChanges
            }
        }));

        return promise
    }
}

class Chatbox{

    constructor(chatbox,server,user) {
        this.chatbox = chatbox;
        this.server = server;
        this.user = user;
    }

    submitChat(){

        if(this.chatbox.value == ""){return;}

        let chatboxText = this.chatbox.value;
        this.chatbox.value = "";

        let chat = {userId: this.user.id, username: this.user.name, body: chatboxText}; //chats have a userId, username and body
        this.server.putChat(chat);
    }

}