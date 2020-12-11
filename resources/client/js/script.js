function Start(){

    //whiteboard object instantiation

    let canvas = document.getElementById('whiteboardCanvas');

    let whiteboardServer = new WhiteboardServer();

    let whiteboard = new Whiteboard(canvas,whiteboardServer);

    let pen = new Pen(whiteboard);

    //chatboard object instantiation

    let chatboardDiv = document.getElementById("chatboard");

    let chatboard = new Chatboard(chatboardDiv,"This is supposed to be a server object");

    //pen events

    document.addEventListener('mousemove', function (event) {pen.moveTo(pen.findPosition(event))});
    document.addEventListener('mousedown', function () {pen.down()}); //these functions are wrapped to retain "this"
    document.addEventListener('mouseup', function () {pen.up()});

    //automatic update

    window.setInterval(function(){whiteboardServer.getWhiteboardEvents().then(events => {whiteboard.handleWhiteboardEvents(events)})}, 250);

    //whiteboard buttons

    document.getElementById("redColorButton").onclick = function() {pen.setColor("red")};
    document.getElementById("greenColorButton").onclick = function() {pen.setColor("green")};
    document.getElementById("blueColorButton").onclick = function() {pen.setColor("blue")};
    document.getElementById("clearWhiteboardButton").onclick = function(){whiteboard.handleClientWhiteboardEvent({type: "clear"})}; //generates clearing events for the whiteboard
    document.getElementById("updateButton").onclick = function(){whiteboardServer.getWhiteboardEvents().then(events => {whiteboard.handleWhiteboardEvents(events)})} //gets then draw new events from the server

    //chat buttons

    document.getElementById("newChatButton").onclick = function() {chatboard.addChat()};

}