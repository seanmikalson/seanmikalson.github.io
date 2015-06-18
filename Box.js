define(function() {
    var Box = function(initx, inity, dimx, dimy, ctx) {
        this.x = initx;
        this.y = inity;
        this.dx = dimx;
        this.dy = dimy;
        this.context = ctx;

        this.hspeed = 0;
        this.vspeed = 0;
        this.acchoriz = 0;
        this.accUp = 0;

        this.maxhspeed = 100;
        this.maxvspeed = 100;
        this.maxhacc = 30;
    };

    /**
     * Accelerates box horizontally
     * @param direction -1 for left, 1 for right, 0 for up
     */
    Box.prototype.accelerate = function(direction) {
        if(direction != -1 && direction != 1 && direction != 0) throw Error('Invalid direction');
        this.acchoriz = (this.acchoriz + 1*direction);
        this.acchoriz = Math.abs(this.acchoriz) > this.maxhacc ? this.maxhacc * direction : this.acchoriz;

        if(direction == 0) {
            this.accUp = -30;
        }
    };

    Box.prototype.decelerate = function(direction) {
        if(direction != -1 && direction != 1 && direction != 0) throw Error('Invalid direction');

        if(direction != 0) {
            this.acchoriz = 0;
        } else {
            this.accUp = 0;
        }
    };

    Box.prototype.applyPhysics = function() {
        this.vspeed = (this.vspeed + Globals.gravity * 0.010 + this.accUp * 0.010);
        this.vspeed = this.vspeed > this.maxvspeed ? this.maxvspeed : this.vspeed;

        this.hspeed = (this.hspeed + this.acchoriz * 0.010 + (this.hspeed / -2) * 0.010);
        this.hspeed = this.hspeed > this.maxhspeed ? this.maxhspeed : this.hspeed;

        this.x = (this.x + this.hspeed * 0.010);
        this.y = (this.y + this.vspeed * 0.010);
    };

    Box.prototype.detectCollision = function() {
        // Simple check if things are within the boundary for now
        if(this.x < 0 || (this.x+this.dx) > 500) {
            this.hspeed = 0;
            this.acchoriz = 0;
            this.x = (this.x < 0) ? this.x - this.x : this.x;
            this.x = ((this.x+this.dx) > 500) ? this.x - ((this.x+this.dx) - 500) : this.x;
        }

        if((this.y+this.dy) > 500 || this.y < 0) {
            this.vspeed = 0;
            this.y = (this.y < 0) ? this.y - this.y : this.y;
            this.y = ((this.y+this.dy) > 500) ? this.y - ((this.y+this.dy) - 500) : this.y;
        }
    };

    Box.prototype.draw = function() {
        this.applyPhysics();
        this.detectCollision();
        this.context.fillRect(this.x, this.y, this.dx, this.dy);
    };

    Box.prototype.reset = function() {
        this.x = 0;
        this.y = 0;
    };

    return {
        Box: Box
    }
});