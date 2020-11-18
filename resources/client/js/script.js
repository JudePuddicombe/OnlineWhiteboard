function Start(){

    let canvas = document.getElementById('whiteboardCanvas');

    let server = new Server();

    let whiteboard = new Whiteboard(canvas,server);

    let pen = new Pen(whiteboard);

    document.addEventListener('mousemove', function (event) {pen.moveTo(pen.findPosition(event))});
    document.addEventListener('mousedown', function () {pen.down()}); //these functions are wrapped to retain "this"
    document.addEventListener('mouseup', function () {pen.up()});

    //window.setInterval(GetServerLines, 5000);

    //whiteboard buttons

    document.getElementById("redColorButton").onclick = function() {pen.setColor("red")};
    document.getElementById("greenColorButton").onclick = function() {pen.setColor("green")};
    document.getElementById("blueColorButton").onclick = function() {pen.setColor("blue")};
    document.getElementById("clearWhiteboardButton").onclick = function(){whiteboard.handleClientWhiteboardEvent({type: "clear"})}; //generates clearing events for the whiteboard
    document.getElementById("updateButton").onclick = function(){whiteboard.handleWhiteboardEvents(server.getWhiteboardEvents())} //gets then draw new events from the server

}