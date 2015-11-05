Z.animation = {
    now : function() {
        if (!Date.now) {
            return new Date().getTime();
        }
        return Date.now();
    },

    animate : function(animation, framer) {
        var frame = animation(Z.animation.now());
        if (frame.playing) {
            Z.Util.requestAnimFrame(function() {
                framer._rendAnimationFrame(frame);
                Z.animation.animate(animation, framer);
            });
        }
    }
};

Z.animation.Easing = {
        /**
         * Start slow and speed up.
         * @param {number} t Input between 0 and 1.
         * @return {number} Output between 0 and 1.
         * @api
         */
        easeIn : function(t) {
          return Math.pow(t, 3);
        },


        /**
         * Start fast and slow down.
         * @param {number} t Input between 0 and 1.
         * @return {number} Output between 0 and 1.
         * @api
         */
        easeOut : function(t) {
          return 1 - Z.animation.Easing.easeIn(1 - t);
        },


        /**
         * Start slow, speed up, and then slow down again.
         * @param {number} t Input between 0 and 1.
         * @return {number} Output between 0 and 1.
         * @api
         */
        inAndOut : function(t) {
          return 3 * t * t - 2 * t * t * t;
        },


        /**
         * Maintain a constant speed over time.
         * @param {number} t Input between 0 and 1.
         * @return {number} Output between 0 and 1.
         * @api
         */
        linear : function(t) {
          return t;
        },


        /**
         * Start slow, speed up, and at the very end slow down again.  This has the
         * same general behavior as {@link inAndOut}, but the final slowdown
         * is delayed.
         * @param {number} t Input between 0 and 1.
         * @return {number} Output between 0 and 1.
         * @api
         */
        upAndDown : function(t) {
          if (t < 0.5) {
            return Z.animation.Easing.inAndOut(2 * t);
          } else {
            return 1 - Z.animation.Easing.inAndOut(2 * (t - 0.5));
          }
        }
};

/**
 * Animation的一帧
 * @param {Boolean} playing 是否处于播放状态
 * @param {Point | Coordinate} point  位置
 * @param {Number} res     分辨率, 用来确定放大比例
 */
Z.animation.Frame = function(playing, point, res) {
    this.playing = playing;
    this.point = point;
    this.res = res;
};

/**
 * 地图滑动动画
 * @param {[type]} options [description]
 */
Z.animation.Pan = function(options) {
    var source = options['source'],
        destination = options['destination'],
        duration = options['duration']?options['duration']:1000,
        start = options['start'] ? options['start'] : Date.now();
    var distance = destination.substract(source);
    var easing = Z.animation.Easing.inAndOut;
    return function(time) {
        if (time < start) {
          return new Z.animation.Frame(false, start, null);
        } else if (time <= start + duration) {
          var delta = easing((time - start) / duration);
          var p = source.add(distance.multi(delta));
          return new Z.animation.Frame(true, p, null);
        } else {
          return new Z.animation.Frame(false, destination, null);;
        }
    };
};
