function Start(){

    let metaCanvas = document.getElementById('whiteboardCanvas');

    let server = new Server();

    let whiteboard = new Whiteboard(metaCanvas,server);

    let pen = new Pen(whiteboard);

    document.addEventListener('mousemove',
        (event) => {
            console.log("mousemove");
            pen.moveTo(pen.findPosition(event));
        });

    document.addEventListener('mousedown', (event) => {
        console.log("mousedown");
        pen.down();
    });

    document.addEventListener('mouseup', (event) => {
        console.log("mouseup");
        pen.up();
    });

    //window.setInterval(GetServerLines, 5000);

    //whiteboard buttons

    document.getElementById("redColorButton").onclick = function(){pen.color = "red"};
    document.getElementById("greenColorButton").onclick = function(){pen.color = "green"};
    document.getElementById("blueColorButton").onclick = function(){pen.color = "blue"};
    document.getElementById("clearWhiteboardButton").onclick = function(){whiteboard.handleClientWhiteboardEvent({type: "clear"})};

}