class Whiteboard{ //writes and manages all lines on the canvas, these come from the pen or directly from the db

    whiteboardLines =[];

    constructor(canvasId,pen) {
        this.canvas = document.getElementById(canvasId).getContext("2d")
        this.pen = pen;
    }

    drawLineSegments(lineSegments){

        console.log("Whiteboard.drawLineSegments"); //console.log for debugging

        //more efficient to iterate within the function than outside the function

        lineSegments.forEach(function(lineSegment){ // for each lineSegment in LineSegments

            if (lineSegment.delete) { //if it is to be deleted delete it

                this.canvas.beginPath();
                this.canvas.moveTo(lineSegment.startX, lineSegment.startY);
                this.canvas.lineTo(lineSegment.endX, lineSegment.endY);
                this.canvas.lineWidth = 3 //width of eraser has to be greater than the width of the normal line
                this.canvas.strokeStyle = "white";
                this.canvas.stroke();

            } else { // otherwise draw it on the canvas

                this.canvas.beginPath();
                this.canvas.moveTo(lineSegment.startX, lineSegment.startY);
                this.canvas.lineTo(lineSegment.endX, lineSegment.endY);
                this.canvas.lineWidth = 1
                this.canvas.strokeStyle = lineSegment.color;
                this.canvas.stroke();

                whiteboardLines.push(lineSegment) //save it to the array of lines currently on the canvas
            }
        })

        for (var i = 0; i < whiteboardLines.length; i++) { //go through the lines on the canvas and remove the lines you just deleted
            if(whiteboardLines[i].delete){whiteboardLines.splice(i,1)}
        }
    }

}

class Server{ //contains all functions used when dealing with the server

    timeToken = 0

    constructor(classroomId) {
        this.classroomId = classroomId
    }

    getLines(){ //in the future the classroom Id will be used to distinguish the different whiteboards

        console.log("Invoked Server.getLines()"); //console.log for debugging

        fetch("/line/get/" + timeToken, {
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

    puLines(){

    }

}

class pen{ //deals with the cursor moving and drawing on the canvas

}
