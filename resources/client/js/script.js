function Start(){

    metaCanvas = document.getElementById('whiteboardCanvas');

    server = new Server();

    whiteboard = new Whiteboard(metaCanvas,server);

    pen = new Pen(whiteboard);

    function myFunction(event){
        console.log("Trying to move")
        pen.moveTo(pen.findPosition(event))
    }

    document.addEventListener('mousemove', myFunction);
    document.addEventListener('mousedown', pen.down);
    document.addEventListener('mouseup', pen.up);
    //window.setInterval(GetServerLines, 5000);

    //whiteboard buttons

    document.getElementById("redColorButton").onclick = function(){pen.color = "red"};
    document.getElementById("greenColorButton").onclick = function(){pen.color = "green"};
    document.getElementById("blueColorButton").onclick = function(){pen.color = "blue"};
    document.getElementById("clearWhiteboardButton").onclick = function(){whiteboard.handleClientWhiteboardEvent({type: "clear"})};

}