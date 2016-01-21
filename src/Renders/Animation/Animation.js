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

    /**
     * resolve styles to start, distance and end.
     * @param  {Object} styles to resolve
     * @return {[Object]}        styles resolved
     */
    _resolveStyles:function(styles) {
        if (!styles) {
            return null;
        }
        var dStyles = {}, startStyles = {}, endStyles = {};
        for (var p in styles) {
            if (styles.hasOwnProperty(p)) {
                var values = styles[p];
                if (Z.Util.isArray(values)) {
                    //[v1,v2], v1 is the start and v2 is the end.
                    var v1 = values[0],
                        v2 = values[1];
                    if (Z.Util.isNumber(v1)) {
                        startStyles[p] = v1;
                        endStyles[p] = v2;
                        dStyles[p] = v2 - v1;
                    } else {
                        if (Z.Util.isArray(v1)) {
                            v1 = new Z.Coordinate(v1);
                        } else if (Z.Symbolizer.testColor(v1)) {
                            v1 = new Z.Color(v1);
                        }
                        var clazz = v1.constructor;
                        startStyles[p] = new clazz(v1);
                        endStyles[p] = new clazz(v2);
                        dStyles[p] = new clazz(v2)._substract(new clazz(v1));
                    }
                } else {
                    //values is just the distance, no start and end.
                    if (Z.Util.isNumber(values)) {
                        dStyles[p] = values;
                        endStyles[p] = values;
                        startStyles[p] = 0;
                    } else {
                        var v = values;
                        if (Z.Util.isArray(values)) {
                            v = new Z.Coordinate(v);
                        } else if (Z.Symbolizer.testColor(values)) {
                            v = new Z.Color(values);
                        }
                        var clazz = v.constructor;
                        if (clazz === Object) {
                            //an object with literal notations, resolve it as a child style.
                            var childStyles = Z.Animation._calcD(v);
                            startStyles[p] = childStyles[0];
                            dStyles[p] = childStyles[1];
                            endStyles[p] = childStyles[2];
                        } else {
                            v = new clazz(values);
                            dStyles[p] = v;
                            endStyles[p] = v;
                            startStyles[p] = new clazz(0,0);
                        }
                    }
                }
            }
        }
        return [startStyles, dStyles, endStyles];
    },

    framing:function(styles, options) {
        var styles = styles,
            duration = options['speed'];
        if (Z.Util.isString(duration)) {duration = Z.Animation.speed[duration];}
        if (!duration) {duration = Z.Animation.speed['normal'];}
        var easing = options['easing']?Z.animation.Easing[options['easing']]:Z.animation.Easing.out;
        if (!easing) {easing = Z.animation.Easing.out;}
        var start = options['start'] ? options['start'] : Z.Animation.now();
        var dStyles, startStyles, endStyles;
        styles = Z.Animation._resolveStyles(styles);
        if (styles) {
            startStyles = styles[0];
            dStyles = styles[1];
            endStyles = styles[2];
        }
        var deltaStyles = function(delta, start, dist) {
            if (!start || !dist) {
                return null;
            }
            var d = {};
            for (var p in dist) {
                if (dist.hasOwnProperty(p)) {
                    var v = dist[p];
                    if (Z.Util.isNumber(v)) {
                        d[p] = start[p] + delta*dist[p];
                    } else {
                        var clazz = v.constructor;
                        if (clazz.constructor === Object) {
                            d[p] = deltaStyles(delta, start[p], dist[p]);
                        } else {
                            d[p] = start[p].add(dist[p].multi(delta));
                        }
                    }
                }
            }
            return d;
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
              // console.log(delta);
              state = {
                'playing' : 1,
                'elapsed' : time-start,
                'delta' : delta
              };
              d = deltaStyles(delta, startStyles, dStyles);
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

    _requestAnimFrame:function(fn) {
        Z.Util.requestAnimFrame(fn);
    },

    animate : function(styles, options, step) {
        if (!options) {
            options = {};
        }
        var animation = Z.Animation.framing(styles, options);
        var player = function() {
            var now = Z.Animation.now();
            var frame = animation(now);
            if (frame.state['elapsed']) {
                //animation started
                if (frame.state['playing']) {
                    var animeFrameId = Z.Animation._requestAnimFrame(function() {
                        if (step) {
                            step._animeFrameId = animeFrameId;
                            var endPlay = step(frame);
                            if (endPlay) {
                                Z.Util.cancelAnimFrame(step._animeFrameId);
                                return;
                            }
                        }

                        player();
                    });
                } else {
                    if (step) {
                    setTimeout(function() {
                            step(frame);
                        },1);
                    }
                }
            } else {
                //延迟到开始时间再开始
                setTimeout(function() {
                    player();
                },frame.state['start']-now);
            }
        }
        Z.Animation._requestAnimFrame(player);

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
