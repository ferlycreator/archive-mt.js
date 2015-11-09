Z.RealtimeRoutePlayer = Z.Class.extend({
    includes: [Z.Eventable],
    /**
     * <pre>
     * 实时轨迹播放器,用于对实时轨迹数据进行轨迹播放。
     * 播放器支持同时播放多条轨迹，但实时轨迹播放不支持进度控制，并能聚焦到指定的轨迹上。
     *
     * 初始化播放器时，按如下说明构造轨迹对象数组，传递给播放器进行初始化。可在轨迹对象中指定轨迹点和轨迹线的样式。
     *
     * 在支持html5 canvas的浏览器中，轨迹线默认用CanvasLayer绘制，不支持则用Svglayer绘制。
     *
     * 参数说明:
     * 		config: {
     * 			timeSpan: 			时间片，即多长时间取一次数据，单位为ms
     * 			enableDrawRoute:	是否绘制轨迹
     * 		},
     * 		routes: {
     * 			[{
     * 				identifier:1,
     * 				symbol: [marker的symbol],
     * 				routeSymbol: [轨迹的symbol]
     * 			 }]
     * 		},
     * 		//实时轨迹数据查询回调函数
     * 		//参数说明： identifier是轨迹的identifier;time是播放器当前时间，一般为客户端的系统时间
     * 		queryDataCallback: function (identifier,time) {
     * 		    //....
     * 			//返回数据数组
     * 			//return [points];
     * 		}
     * </pre>
     * @constructor
     * @param map {Z.Map} 地图对象
     * @param config {Object} 播放设置
     * @param routes {[Object]} 轨迹数组
     * @param queryDataCallback {function} 实时轨迹数据查询回调函数
     * @returns {Z.RealtimeRoutePlayer}
     */
    initialize: function(map, config, routes, queryDataCallback) {
        this.player = null;
        this.map = map;
        config && (this.timeSpan = config["timeSpan"], this.enableDrawRoute = config["enableDrawRoute"]);
        this.timeSpan || (this.timeSpan = 1E3);
        this.unitTime = this.timeSpan / 1E3;
        this.enableDrawRoute || (this.enableDrawRoute = !0);
        this.routes = routes;
        this.identifiers = [];
        this.routeObjs = {};
        this.queryDataCallback = queryDataCallback;
        this._initialize();
        return this;
    },

    /**
     * 显示轨迹
     * @expose
     * @param identifier {String|Number} 轨迹的identifier
     */
    show:function(identifier) {
        this.player && this.player.show(identifier);
    },
    /**
     * 隐藏轨迹
     * @expose
     * @param identifier {String|Number} 轨迹的identifier
     */
    hide:function(identifier) {
        this.player && this.player.hide(identifier);
    },
    /**
     * 取消聚焦
     * @expose
     */
    unfocus:function() {
      this.player && this.player.unfocus();
    },
    /**
     * 聚焦指定的轨迹
     * @expose
     * @param identifier {String|Number} 轨迹的identifier
     */
    focus:function(identifier) {
      this.player && identifier && this.player.focus(identifier);
    },
    /**
     * 开始播放
     * @expose
     */
    start:function() {
      this.initializeRoute();
      this.player && (this.player.currentTime = (new Date).getTime(), this.player.start());
    },
    /**
     * 暂停播放
     * @expose
     */
    pause:function() {
      this.player && this.player.pause();
    },
    /**
     * 回复播放
     * @expose
     */
    resume:function() {
      this.player && this.player.resume();
    },
    /**
     * 停止播放
     * @expose
     */
    stop:function() {
      this.player && this.player.stop();
    },
    /**
     * 初始化
     */
    _initialize:function() {
      if(this.map) {
        var _this = this;
        if (!this.player) {
            this.player = new Z.RoutePlayer(
                this.map, {"timeSpan":this.timeSpan, "unitTime":this.unitTime, "enableDrawRoute":this.enableDrawRoute},
            {
                "getIds":function() {
                        return _this.identifiers;
                },
                "getMarkerSymbol":function(a) {
                    return _this.getSymbol(a, "symbol");
                },
                "getRouteSymbol":function(a) {
                    return _this.getSymbol(a, "routeSymbol");
                },
                "start":function(identifier,time) {
                    return _this.queryDataCallback(identifier,time);
                },
                "next":function(identifier,time) {
                    var ret =  _this.queryDataCallback(identifier,time);
                    if (!ret || !(Z.Util.isArray(ret))) {
                        return;
                    }
                    return ret;
                }
            });
            this.player["getCurrentTime"] = function() {
              return(new Date).getTime();
            };
        }
        this.registerEvents();
      }
    },
    initializeRoute:function() {
        if(this.map && this.routes && this.routes.length && this.queryDataCallback) {
            this.identifiers = [];
            var routes = this.routes;
            for(var i = 0, len = routes.length;i < len;i++) {
                if (routes[i]["identifier"]) {
                    this.identifiers.push(routes[i]["identifier"]);
                    this.routeObjs[routes[i]["identifier"]] = this.routes[i];
                }
            }
        }
    },
    registerEvents:function() {
        var _this = this;
        var player = this.player;
        /**
         * 播放开始事件
         * @event playstarted
         * @param target {Z.RealtimeRoutePlayer} 播放器对象
         */
        player.addEventListener("playstarted", function(param) {
            param.target = _this;
            _this.fire( "playstarted", param);
        });

        /**
         * 播放暂停事件
         * @event playpaused
         * @param target {Z.RealtimeRoutePlayer} 播放器对象
         */
        player.addEventListener("playpaused", function(param) {
            param.target = _this;
            _this.fire( "playpaused", param);
        });

        /**
         * 播放恢复事件
         * @event playresumed
         * @param target {Z.RealtimeRoutePlayer} 播放器对象
         */
        player.addEventListener("playresumed", function(param) {
            param.target = _this;
            _this.fire( "playresumed", param);
        });

        /**
         * 播放进行事件
         * @event playing
         * @param target {Z.RealtimeRoutePlayer} 播放器对象
         */
        player.addEventListener("playing", function(param) {
            param.target = _this;
            _this.fire( "playing", param);
        });

        /**
         * 播放停止事件
         * @event playended
         * @param target {Z.RealtimeRoutePlayer} 播放器对象
         */
        player.addEventListener("playended", function(param) {
            _this.fire( "playended", param);
        });

        /**
         * 轨迹播放开始事件
         * @event routestared
         * @param target {String:Number} 轨迹的identifier
         * @param t {Number} 播放器时间
         */
        player.addEventListener("routestarted", function(param) {
            _this.fire( "routestarted", param);
        });

        /**
         * 轨迹播放进行事件
         * @event routeplaying
         * @param target {String:Number} 轨迹的identifier
         * @param t {Number} 播放器时间
         */
        player.addEventListener("routeplaying", function(param) {
            _this.fire( "routeplaying", param);
        });

        /**
         * 轨迹播放结束事件
         * @event routeended
         * @param target {String:Number} 轨迹的identifier
         * @param t {Number} 播放器时间
         */
        player.addEventListener("routeended", function(param) {
            _this.fire( "routeended", param);
        });
    },

    getSymbol:function(identifier, symbolType) {
        if(!identifier) {
            return null;
        }
        var routeObj = this.routeObjs[identifier];
        return routeObj ? routeObj[symbolType] : null;
    },

    /**
     * 取得播放器时间
     * @returns {Number} 播放器时间
     * @expose
     */
    getCurrentTime:function() {
        return(new Date).getTime();
    },

    /**
     * 设定播放器的TimeSpan，改变播放器获取数据的时间频率，timeSpan越小，轨迹播放越平滑但CPU占用率越高。
     * @param timeSpan {Number} timeSpan
     * @expose
     */
    setTimeSpan:function(timeSpan) {
        if (!this.player) return;
        this.player.setTimeSpan(timeSpan);
    },

    /**
     * 设定播放器的unitTime，改变每个timeSpan对应的真实事件，unitTime越大，播放速度越快
     * @param unitTime {Number} unitTime
     * @expose
     */
    setUnitTime:function(unitTime) {
        if (!this.player) return;
        this.player.setUnitTime(unitTime);
    },

    /**
     * 获取播放器的timeSpan
     * @returns {Number}
     * @expose
     */
    getTimeSpan:function() {
        if (!this.player) return null;
        return this.player.timeSpan;
    },

    /**
     * 获取播放器的unitTime
     * @returns {Number}
     * @expose
     */
    getUnitTime:function() {
        if (!this.player) return null;
        return this.player.unitTime;
    }
});