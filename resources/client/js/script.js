function Start(){

    window.clientChanges = [];
    window.whiteboardLines = [];
    window.timeToken = 0;
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
                SendClientLines(changes[0])
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
    //window.setInterval(GetServerLines, 5000);

    //whiteboard buttons

    document.getElementById("redColorButton").onclick = function(){pen.color = "red"}
    document.getElementById("greenColorButton").onclick = function(){pen.color = "green"}
    document.getElementById("blueColorButton").onclick = function(){pen.color = "blue"}
    document.getElementById("clearWhiteboardButton").onclick = function(){ClearWhiteboard()}
    document.getElementById("updateButton").onclick = function(){GetServerLines()}

}