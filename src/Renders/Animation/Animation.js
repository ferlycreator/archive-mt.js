Z.animation = {
    now : function() {
        if (!Date.now) {
            return new Date().getTime();
        }
        return Date.now();
    },

    animate : function(animation, framer, listener, context) {
        var now = Z.animation.now();
        var frame = animation(now);
        if (listener) {
            if (context) {
                listener.call(context,frame);
            } else {
                listener(frame);
            }
        }
        if (frame.state['playing']) {
            Z.Util.requestAnimFrame(function() {
                framer._rendAnimationFrame(frame);
                Z.animation.animate(animation, framer, listener, context);
            });
        } else {
            if (!frame.state['end']) {
                 //延迟到开始时间再开始
                setTimeout(function() {
                    Z.animation.animate(animation, framer, listener, context);
                },frame.state['startTime']-now);
            }
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
 * @param {Number} scale     放大比例
 */
Z.animation.Frame = function(state, point, scale) {
    this.state = state;
    this.point = point;
    this.scale = scale;
};

/**
 * 地图滑动动画
 * @param {[type]} options [description]
 */
Z.animation.pan = function(options) {
    var source = options['source'],
        destination = options['destination'],
        duration = options['duration']?options['duration']:1000,
        start = options['start'] ? options['start'] : Date.now();
    var distance = destination.substract(source);
    var easing = Z.animation.Easing.inAndOut;
    return function(time) {
        if (time < start) {
          return new Z.animation.Frame({'playing':false,'startTime':start, 'end':false}, source, null);
        } else if (time < start + duration) {
          var delta = easing((time - start) / duration);
          var d = distance.multi(delta);

          var p = source.add(d);
          // console.log(p);
          return new Z.animation.Frame({'playing':true,'startTime':start, 'end':false}, p, null);
        } else {
          return new Z.animation.Frame({'playing':false,'startTime':start, 'end':true}, destination, null);
        }
    };
};


/**
 * Generate an animated transition while updating the view resolution.
 * @param {olx.animation.ZoomOptions} options Zoom options.
 * @return {ol.PreRenderFunction} Pre-render function.
 * @api
 */
Z.animation.zoom = function(options) {
  var scale1 = options['scale1'],
        scale2 = options['scale2'],
        duration = options['duration']?options['duration']:1000,
        start = options['start'] ? options['start'] : Date.now();
  var easing = options['easing'] ?
      options['easing'] : Z.animation.Easing.inAndOut;
  return (
      function(time) {
        if (time < start) {
          return new Z.animation.Frame({'playing':false,'startTime':start, 'end':false}, null, 1);
        } else if (time < start + duration) {
          var delta = easing((time - start) / duration);
          var s = scale1+(scale2-scale1)*delta;
          // console.log(p);
          return new Z.animation.Frame({'playing':true,'startTime':start, 'end':false}, null, s);
        } else {
          return new Z.animation.Frame({'playing':false,'startTime':start, 'end':true}, null, scale2);
        }
      });
};
