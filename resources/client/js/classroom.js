function start(){

    let user;
    let classroomId;

    try{

        user = {name: localStorage.getItem("username"), id: localStorage.getItem("userId")}
        classroomId = localStorage.getItem("classroomId");

    } catch(err) {

        user = {name: "Jude", id: "00000"}; //for development perposes while the other sites are not working these will be the default values
        classroomId = "00000";
    }

    //whiteboard object instantiation

    let canvas = document.getElementById('whiteboardCanvas');

    let whiteboardServer = new WhiteboardServer(classroomId);

    let whiteboard = new Whiteboard(canvas);

    let pen = new Pen(whiteboard,whiteboardServer);

    //chatboard object instantiation

    let chatboardDiv = document.getElementById("internalChatboard");

    let chatboardServer = new ChatboardServer(classroomId);

    let chatboard = new Chatboard(chatboardDiv,user);

    let myChatbox = document.getElementById("chatbox");

    let chatbox = new Chatbox(myChatbox,chatboardServer,user);

    //pen events

    canvas.addEventListener('mousemove', function (event) {pen.moveTo(pen.findPosition(event))});
    //canvas.addEventListener('mousemove', function (event) {pen.moveTo(event)});
    document.addEventListener('mousedown', function () {pen.down()}); //these functions are wrapped to retain "this"
    document.addEventListener('mouseup', function () {pen.up()});

    //automatic update

    //window.setInterval(function(){whiteboardServer.getWhiteboardEvents().then(events => {whiteboard.handleWhiteboardEvents(events)})}, 250);
    //window.setInterval(function(){chatboardServer.getChats().then(chats => {chatboard.addChats(chats)})}, 500);

    //whiteboard buttons

    //document.getElementById("whiteboardWidth").oninput = function () {pen.setWidth(this.value)};// this refers to the slider (That doesn't exsist rn)
    document.getElementById("redColorButton").onclick = function() {pen.setColor("red")};
    document.getElementById("greenColorButton").onclick = function() {pen.setColor("green")};
    document.getElementById("blueColorButton").onclick = function() {pen.setColor("blue")};
    //document.getElementById("whiteColorButton").onclick = function() {pen.setColor("white")};// this refers to a button (That doesn't exsist rn)
    document.getElementById("clearWhiteboardButton").onclick = function(){pen.clear()}; //generates clearing events for the whiteboard
    document.getElementById("updateWhiteboardButton").onclick = function(){whiteboardServer.getWhiteboardEvents().then(events => {whiteboard.handleWhiteboardEvents(events)})}//gets then draw new events from the server

    //chat buttons

    document.getElementById("newChatButton").onclick = function() {chatbox.submitChat()};
    document.getElementById("updateChatButton").onclick = function(){chatboardServer.getChats().then(chats => {chatboard.addChats(chats)})}

}