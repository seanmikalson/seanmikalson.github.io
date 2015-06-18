require.config({
    paths: {
        jquery: 'http://code.jquery.com/jquery-1.11.2.min',
        io: 'https://cdn.socket.io/socket.io-1.3.5',
        jquerymobile: 'http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min'
    }
});

require(['jquery', 'io','Box','defines','jquerymobile'],
function($,io,b,defines) {

    var canvas = document.getElementById("joust");
    var ctx = canvas.getContext("2d");
    var controljoust = document.getElementById('control-joust');
    var controlctx = controljoust.getContext('2d');
    controlctx.canvas.width  = window.innerWidth;
    controlctx.canvas.height = window.innerHeight;

    var socket = io.connect((defines.Globals.dev ? 'localhost:5000' : 'http://radiant-woodland-2953.herokuapp.com'));

    var box = new b.Box(0,0,80,80,ctx);
    var boxes = {};

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left/(rect.right-rect.left)*canvas.width,
            y: evt.clientY - rect.top/(rect.bottom-rect.top)*canvas.height
        };
    }
    var touchx = 0;
    var touchy = 0;

    var character;

    socket.on('connect', function(){

        $('#displaybutton').click(function(event) {
            $('#modechoice').fadeOut(function() {
                $('#gamedisp').fadeIn();

                setInterval(function() {
                    // Clears the canvas
                    ctx.clearRect(0,0,500,500);
                    for(var box in boxes) {
                        console.log(box);
                        if(boxes.hasOwnProperty(box)) {
                            boxes[box].draw();
                        }
                    }

                    controlctx.clearRect(0,0,controlctx.canvas.width,controlctx.canvas.height);
                    controlctx.beginPath();
                    controlctx.arc(touchx,touchy,40,0,2*Math.PI);
                    controlctx.stroke();
                },10);
            });

            socket.emit('display', null);
        });

        $('#controlbutton').click(function(event) {
            $('#modechoice').fadeOut(function() {
                $('#enter-id').fadeIn();
            });
        });

        $('#gameidsubmit').click(function(event) {
            gameid = $('#gameidinput').val();
            $('#enter-id').fadeOut(function() {
                $('#choose-player').fadeIn();
            });
        });

        $('.playerchoice').click(function(event) {
            character = $(this).val();
            socket.emit('control', {gameid:gameid, character:character});

            $('#control-joust').on('vmousemove', function(event) {
                event.preventDefault();
                var pos = getMousePos(controljoust, event);
                touchx = pos.x;
                touchy = pos.y;

                if(touchx > controlctx.canvas.width/2) {
                    socket.emit('down-' + gameid, {event:39,character:character});
                } else {
                    socket.emit('down-' + gameid, {event:37,character:character});
                }

                if(touchy > controlctx.canvas.height/2) {
                    socket.emit('up-'+gameid, {event:38,character:character});
                } else {
                    socket.emit('down-'+gameid, {event:38,character:character});
                }
            });

            $('#control-area').fadeIn();
        });

        socket.on('display', function(game) {
            var gameid = game.gameid;
            $('#gameid').html('<h3 class="text-center">Game ID: ' + gameid + '</h3>');

            socket.on('control'+gameid, function(data) {
                boxes[data.character] = new b.Box(0,0,80,80,ctx,data.character);

                socket.on('down-'+gameid, function(data) {
                    switch(data.event) {
                        case 38: //up
                            boxes[data.character].accelerate(0);
                            break;
                        case 37: //left
                            boxes[data.character].accelerate(-1);
                            break;
                        case 39: //right
                            boxes[data.character].accelerate(1);
                            break;
                        default:
                            break;
                    }
                });

                socket.on('up-'+gameid, function(data) {
                    switch(data.event) {
                        case 38:
                            boxes[data.character].decelerate(0);
                            break;
                        case 37:
                        case 39:
                            boxes[data.character].decelerate(1);
                            break;
                        default:
                            break;
                    }
                });
            });
        });
    });

});
