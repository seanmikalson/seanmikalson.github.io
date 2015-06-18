require.config({
    paths: {
        jquery: 'http://code.jquery.com/jquery-1.11.2.min',
        io: 'https://cdn.socket.io/socket.io-1.3.5'
    }
});

require(['jquery', 'io','Box','defines'],
function($,io,b,defines) {

    var canvas = document.getElementById("joust");
    var ctx = canvas.getContext("2d");
    var controljoust = document.getElementById('control-joust');
    var controlctx = controljoust.getContext('2d');
    controlctx.canvas.width  = window.innerWidth;
    controlctx.canvas.height = window.innerHeight;

    ctx.fillStyle = "#FF0000";
    var socket = io.connect((defines.Globals.dev ? 'localhost:5000' : 'http://radiant-woodland-2953.herokuapp.com'));

    var box = new b.Box(0,0,80,80,ctx);

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left/(rect.right-rect.left)*canvas.width,
            y: evt.clientY - rect.top/(rect.bottom-rect.top)*canvas.height
        };
    }
    var touchx = 0;
    var touchy = 0;

    socket.on('connect', function(){

        $('#displaybutton').click(function(event) {
            $('#modechoice').fadeOut(function() {
                $('#gamedisp').fadeIn();

                setInterval(function() {
                    // Clears the canvas
                    ctx.clearRect(0,0,500,500);
                    box.draw();

                    controlctx.clearRect(0,0,controlctx.canvas.width,controlctx.canvas.height);
                    controlctx.beginPath();
                    controlctx.arc(touchx,touchy,40,0,2*Math.PI);
                    controlctx.stroke();

                    $('#hspeed').html('Hspeed:' + box.hspeed);
                    $('#hacc').html('Hacc: ' + box.acchoriz);
                    $('#vspeed').html('vspeed: ' + box.vspeed);
                    $('#x').html('x: ' + box.x);
                    $('#y').html('y: ' + box.y);
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
            var gameid = $('#gameidinput').val();
            socket.emit('control', gameid);

            $('#control-joust').on('vmousemove', function(event) {
                event.preventDefault();
                var pos = getMousePos(controljoust, event);
                touchx = pos.x;
                touchy = pos.y;

                if(touchx > controlctx.canvas.width/2) {
                    socket.emit('down-' + gameid, 39);
                } else {
                    socket.emit('down-' + gameid, 37);
                }

                if(touchy > controlctx.canvas.height/2) {
                    socket.emit('up-'+gameid, 38);
                } else {
                    socket.emit('down-'+gameid, 38);
                }
            });

            $('#enter-id').fadeOut(function() {
                $('#choose-player').fadeIn();
            });

            //TODO fade in control area once character is chosen
        });

        $('.playerchoice').click(function(event) {
            switch($(this).val()) {
                case 'blue':

                    break;
                case 'red': //red

                    break;
                default:
                    break;
            }
        });

        socket.on('display', function(game) {
            var gameid = game.gameid;
            $('#gameid').html('<h3 class="text-center">Game ID: ' + gameid + '</h3>');

            socket.on('down-'+gameid, function(event) {
                switch(event) {
                    case 38: //up
                        box.accelerate(0);
                        break;
                    case 37: //left
                        box.accelerate(-1);
                        break;
                    case 39: //right
                        box.accelerate(1);
                        break;
                    default:
                        break;
                }
            });

            socket.on('up-'+gameid, function(event) {
                switch(event) {
                    case 38:
                        box.decelerate(0);
                        break;
                    case 37:
                    case 39:
                        box.decelerate(1);
                        break;
                    default:
                        break;
                }
            });
        });
    });

});
