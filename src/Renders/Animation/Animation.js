//package
Z.animation = {};

Z.Animation = {
    speed:{
        'slow'   : 2000,
        'normal' : 1000,
        'fast'   : 500
    },

    now : function() {
        if (!Date.now) {
            return new Date().getTime();
        }
        return Date.now();
    },

    framing:function(styles, options) {
        var styles = styles,
            duration = options['speed'];
        if (Z.Util.isString(duration)) {duration = Z.Animation.speed[duration];}
        if (!duration) {Z.Animation.speed['normal'];}
        var easing = options['easing']?Z.animation.Easing[options['easing']]:Z.animation.Easing.out;
        if (!easing) {easing = Z.animation.Easing.out;}
        var start = options['start'] ? options['start'] : Z.Animation.now();
        //caculate
        var dStyles = {},
            startStyles = {},
            endStyles = {};
        if (styles) {
            for (var p in styles) {
                if (styles.hasOwnProperty(p)) {
                    var values = styles[p];
                    if (Z.Util.isArray(values)) {
                        if (Z.Util.isNumber(values[0])) {
                            startStyles[p] = values[0];
                            endStyles[p] = values[1];
                            dStyles[p] = values[1] - values[0];
                        } else {
                            var v = values[0];
                            if (Z.Util.isArray(values[0])) {
                                v = new Z.Coordinate(v);
                            }
                            var clazz = v.constructor;
                            startStyles[p] = new clazz(v);
                            endStyles[p] = new clazz(values[1]);
                            dStyles[p] = new clazz(values[1])._substract(new clazz(v));
                        }
                    } else {
                        if (Z.Util.isNumber(values)) {
                            dStyles[p] = values;
                            endStyles[p] = values;
                            startStyles[p] = 0;
                        } else {
                            var v = values;
                            if (Z.Util.isArray(values)) {
                                v = new Z.Coordinate(v);
                            }
                            var clazz = v.constructor;
                            var pnt = new clazz(values);
                            dStyles[p] = pnt;
                            endStyles[p] = pnt;
                            startStyles[p] = new clazz(0,0);
                        }
                    }

                }
            }
        }
        return function(time) {
            var state, d;
            if (time < start) {
              state = {
                'playing' : 0,
                'elapsed' : 0,
                'delta'   : 0
              };
              d = startStyles;
            } else if (time < start + duration) {
              var delta = easing((time - start) / duration);
              state = {
                'playing' : 1,
                'elapsed' : time-start,
                'delta' : delta
              };
              if (dStyles) {
                    d = {};
                    for (var p in dStyles) {
                        if (dStyles.hasOwnProperty(p)) {
                            var values = dStyles[p];
                            if (Z.Util.isNumber(values)) {
                                d[p] = startStyles[p] + delta*dStyles[p];
                            } else {
                                d[p] = startStyles[p].add(dStyles[p].multi(delta));
                            }
                        }
                    }
              }
            } else {
              state = {
                'playing' : 0,
                'elapsed' : time-start,
                'delta' : 1
              };
              d = endStyles;
            }
            state['start'] = start;
            return new Z.animation.Frame(state ,d);
        };

    },

    animate : function(styles, options, step) {
        var animation = Z.Animation.framing(styles, options);
        var player = function() {
            var now = Z.Animation.now();
            var frame = animation(now);
            if (frame.state['elapsed']) {
                //animation started
                if (frame.state['playing']) {
                    var animeFrameId = Z.Util.requestAnimFrame(function() {
                        step._animeFrameId = animeFrameId;
                        var endPlay = step(frame);
                        if (endPlay) {
                            Z.Util.cancelAnimFrame(step._animeFrameId);
                            return;
                        }
                        player(animation, step);
                    });
                } else {
                    setTimeout(function() {
                        step(frame);
                    },1);
                }
            } else {
                //延迟到开始时间再开始
                setTimeout(function() {
                    player(animation, step);
                },frame.state['start']-now);
            }
        }
        player();

    }
};

Z.animation.Easing = {
        /**
         * Start slow and speed up.
         * @param {number} t Input between 0 and 1.
         * @return {number} Output between 0 and 1.
         * @api
         */
        in : function(t) {
          return Math.pow(t, 3);
        },


        /**
         * Start fast and slow down.
         * @param {number} t Input between 0 and 1.
         * @return {number} Output between 0 and 1.
         * @api
         */
        out : function(t) {
          return 1 - Z.animation.Easing.in(1 - t);
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
Z.animation.Frame = function(state, styles) {
    this.state = state;
    this.styles = styles;
};
