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

        if (frame.state['playing']) {
            var animeFrameId = Z.Util.requestAnimFrame(function() {
                framer.animeFrameId = animeFrameId;
                if (listener) {
                    var pause;
                    if (context) {
                        pause = listener.call(context,frame);
                    } else {
                        pause = listener(frame);
                    }
                    if (pause) {
                        Z.Util.cancelAnimFrame(framer.animeFrameId);
                        return;
                    }
                }
                framer._rendAnimationFrame(frame);
                Z.animation.animate(animation, framer, listener, context);
            });
        } else {
            if (!frame.state['end']) {
                 //延迟到开始时间再开始
                setTimeout(function() {
                    Z.animation.animate(animation, framer, listener, context);
                },frame.state['startTime']-now);
            } else {
                if (listener) {
                    setTimeout(function() {
                        if (context) {
                            listener.call(context,frame);
                        } else {
                            listener(frame);
                        }
                    },1);
                }
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
 * @param {Point} distance  移动距离
 * @param {Number} scale     放大比例
 */
Z.animation.Frame = function(state, distance, scale) {
    this.state = state;
    this.distance = distance;
    this.scale = scale;
};

/**
 * 地图滑动动画
 * @param {[type]} options [description]
 */
Z.animation.pan = function(options) {
    var distance = options['distance'],
        duration = options['duration']?options['duration']:1000,
        start = options['start'] ? options['start'] : Date.now();
    var easing = Z.animation.Easing.easeOut;
    var preDistance = null;
    return function(time) {
        if (time < start) {
          return new Z.animation.Frame({'playing':false,'startTime':start, 'end':false}, null, null);
        } else if (time < start + duration) {
          if (!preDistance) {
            preDistance = new Z.Point(0,0);
          }
          var delta = easing((time - start) / duration);
          var d = distance.multi(delta);
          var frameDistance = d.substract(preDistance);
          preDistance = d;
          return new Z.animation.Frame({'playing':true,'startTime':start, 'end':false}, frameDistance, null);
        } else {
          return new Z.animation.Frame({'playing':false,'startTime':start, 'end':true}, distance, null);
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
