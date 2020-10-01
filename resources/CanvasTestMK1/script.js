function GetMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function UpdateWhiteboard(){

    for (var i = 0; i < lines.length; i++){

        if (lines[i].delete) {

            whiteboard.beginPath();
            whiteboard.moveTo(lines[i].startX, lines[i].startY);
            whiteboard.lineTo(lines[i].endX,lines[i].endY);

            whiteboard.strokeStyle = "white";
            whiteboard.stroke();

        } else {

            whiteboard.beginPath();
            whiteboard.moveTo(lines[i].startX, lines[i].startY);
            whiteboard.lineTo(lines[i].endX,lines[i].endY);

            whiteboard.strokeStyle = lines[i].color;
            whiteboard.stroke();
        }
    }

    lines = [];

}

function KeyPress(key){
    console.log("Key press detected")
    switch(key){
        case "a":
            console.log("Attempting to clear")
            whiteboard.clearRect(0, 0, canvas.width, canvas.height);
            break;
        case "b":
            UpdateWhiteboard()
            break;
        default:
            // something here
    }


}

function Start(){

    window.lines = []
    window.canvas = document.getElementById('myCanvas');
    window.whiteboard = canvas.getContext("2d");

    var pen = {
        drawing: false,
        position: {x:0,y:0},
        color: 'blue',
        newPoint: function(coord) {
            if(this.drawing){

                whiteboard.beginPath();
                whiteboard.moveTo(this.position.x, this.position.y);
                whiteboard.lineTo(coord.x,coord.y);

                whiteboard.strokeStyle = this.color;
                whiteboard.stroke();

                lines.push({startX: this.position.x, startY: this.position.y, endX: coord.x, endY: coord.y, color: this.color, delete: false})

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



}