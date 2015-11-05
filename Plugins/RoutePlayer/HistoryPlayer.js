Z.HistoryRoutePlayer = Z.Class.extend({
    includes: [Z.Eventable],
    /**
     * <pre>
     * 历史轨迹播放器,用于对历史轨迹数据进行轨迹播放。
     * 播放器支持同时播放多条轨迹，支持进度控制，并能聚焦到指定的轨迹上。
     *
     * 初始化播放器时，按如下说明构造轨迹对象数组，传递给播放器进行初始化。可在轨迹对象中指定轨迹点和轨迹线的样式。
     *
     * 在支持html5 canvas的浏览器中，轨迹线默认用CanvasLayer绘制，不支持则用Graphiclayer绘制。
     *
     * 参数说明:
     * 		config: {
     * 			timeSpan: 			时间片，即多长时间播放一次，单位为ms
     * 			unitTime: 			即每个时间片对应的真实时间，单位为ms
     * 			enableDrawRoute:	是否绘制轨迹
     * 		},
     * 		routes: {
     * 			[{
     * 				identifier:1,
     * 				route:[{
     * 							x: [x坐标],
     * 							y: [y坐标],
     * 							t: [时间]
     * 						}],
     * 				symbol: [marker的symbol],
     * 				routeSymbol: [轨迹的symbol]
     * 			 },
     * 			 ...
     * 			]
     * 		}
     *
     * </pre>
     * @constructor
     * @param map {Z.Map} 地图对象
     * @param config {Object} 播放设置
     * @param routes {[Object]} 轨迹数组
     * @returns {Z.HistoryRoutePlayer}
     */
    initialize: function(map, config, routes) {
        this.player = null;
        this.map = map;
        if (config) {
            this.timeSpan = config["timeSpan"],
            this.unitTime = config["unitTime"],
            this.enableDrawRoute = config["enableDrawRoute"],
            this.mode = config["mode"];
        }
        this.timeSpan || (this.timeSpan = 300);
        this.unitTime || (this.unitTime = 5);
        this.enableDrawRoute || (this.enableDrawRoute = true);
        this.mode || (this.mode = "graphics");
        this.routes = routes;
        this.identifiers = [];
        this.routeObjs = {};
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
     * 聚焦轨迹
     * @expose
     * @param identifier {String|Number} 聚焦轨迹的identifier
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
      this.player && this.player.start();
    },
    /**
     * 暂停播放
     * @expose
     */
    pause:function() {
      this.player && this.player.pause();
    },
    /**
     * 恢复播放
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
     * 设定播放时间
     * @expose
     * @param time {Number} 播放时间
     */
    setTime:function(time) {
      if (this.player && time!=null)
          this.player.setTime(time);
    },
    /**
     * 获得播放器的当前时间
     * @expose
     * @returns {Number}
     */
    getCurrentTime:function() {
      return this.player ? this.player.getCurrentTime() : null;
    },
    /**
     * 初始化
     */
    _initialize:function() {
      if(this.map) {
        if(!this.player) {
          var me = this;
          this.player = new Z.RoutePlayer(this.map,
              {
                "timeSpan":this.timeSpan,
                "unitTime":this.unitTime,
                "enableDrawRoute":this.enableDrawRoute
              },
              {
                "getIds":function() {
                    return me.identifiers;
                },
                "getMarkerSymbol":function(identifier) {
                    return me.getSymbol(identifier, "symbol");
                },
                "getRouteSymbol":function(identifier) {
                    return me.getSymbol(identifier, "routeSymbol");
                },
                "start":function(identifier) {
                    return me.getStartPoint(identifier);
                },
                "next":function(identifier, time) {
                    return me.computeNextPoint(identifier, time);
                },
                "getRoute":function(identifier,time) {
                    return me.getRoute(identifier,time);
                }
          });
          this.registerEvents();
        }
      }
    },
    initializeRoute:function() {
        if(this.map && this.routes && this.routes.length) {
            this.identifiers = [];
            var routes = this.routes;
            for(var i = 0, len = routes.length;i < len;i++) {
                if (routes[i]["identifier"] && routes[i]["route"]) {
                    this.identifiers.push(routes[i]["identifier"]);
                    this.routes[i].counter = 0;
                    this.routeObjs[routes[i]["identifier"]] = this.routes[i];
                }
            }
        }
    },
    /**
     * 注册事件
     */
    registerEvents:function() {
        var me = this;
        var player = this.player;
        /**
        * 播放开始事件
        * @event playstarted
        * @param target {Z.HistoryRoutePlayer} 播放器对象
        */
        player.addEventListener("playstarted", function(param) {
            param["target"] = me;
            me.fire("playstarted", param);
        });
        /**
        * 播放暂停事件
        * @event playpaused
        * @param target {Z.HistoryRoutePlayer} 播放器对象
        */
        player.addEventListener("playpaused", function(param) {
            param["target"] = me;
            me.fire( "playpaused", param);
        });
        /**
        * 播放恢复事件
        * @event playresumed
        * @param target {Z.HistoryRoutePlayer} 播放器对象
        */
        player.addEventListener("playresumed", function(param) {
            param["target"] = me;
            me.fire( "playresumed", param);
        });
        /**
        * 播放进行事件
        * @event playing
        * @param target {Z.HistoryRoutePlayer} 播放器对象
        */
        player.addEventListener("playing", function(param) {
            param["target"] = me;
            me.fire( "playing", param);
        });
        /**
        * 播放停止事件
        * @event playended
        * @param target {Z.HistoryRoutePlayer} 播放器对象
        */
        player.addEventListener("playended", function(param) {
            me.fire( "playended", param);
        });
        /**
        * 轨迹播放开始事件
        * @event routestared
        * @param target {String:Number} 轨迹的identifier
        * @param t {Number} 播放器时间
        */
        player.addEventListener("routestarted", function(param) {
            me.fire( "routestarted", param);
        });
        /**
        * 轨迹播放进行事件
        * @event routeplaying
        * @param target {String:Number} 轨迹的identifier
        * @param t {Number} 播放器时间
        */
        player.addEventListener("routeplaying", function(param) {
            me.fire( "routeplaying", param);
        });
        /**
        * 轨迹播放结束事件
        * @event routeended
        * @param target {String:Number} 轨迹的identifier
        * @param t {Number} 播放器时间
        */
        player.addEventListener("routeended", function(param) {
            me.fire( "routeended", param);
        });
    },
    /**
     * 获取设定的symbol
     * @param identifier
     * @param symbolType
     * @returns
     */
    getSymbol:function(identifier, symbolType) {
      if(!identifier) {
        return null;
      }
      var routeObj = this.routeObjs[identifier];
      return routeObj ? routeObj[symbolType] : null;
    },
    /**
     * 获取轨迹的第一个点
     * @param identifier
     * @returns
     */
    getStartPoint:function(identifier) {
      if(!identifier) {
        return null;
      }
      var routeObj = this.routeObjs[identifier];
      if(!routeObj) {
        return null;
      }
      var route = routeObj["route"];
      return!route || !route.length || 0 >= route.length ? null : route[0];
    },
    /**
     *
     * @param identifier
     * @param time
     * @returns
     */
    getRoute:function(identifier, time) {
         if(!identifier || !time) {
            return null;
          }
          var routeObj = this.routeObjs[identifier];
          if(!routeObj) {
            return null;
          }
          var route = routeObj["route"];
          var ret = [];
          routeObj.counter=0;
          for (var i=0, len=route.length;i<len;i++) {
              if (route[i]["t"]<time) {
                  ret.push(route[i]);
                  routeObj.counter++;
              } else {
                 break;
              }
          }
          return ret;
    },
    /**
     * 计算当前播放的轨迹点坐标
     * @param identifier
     * @param time
     * @returns
     */
    computeNextPoint:function(identifier, time) {
      if(!identifier || !time) {
        return null;
      }
      var routeObj = this.routeObjs[identifier];
      if(!routeObj) {
        return null;
      }
      var route = routeObj["route"];
      var counter = routeObj.counter;
      if(counter >= route.length) {
        return -1;
      }
      var ret = [];
      var prePoint,nextPoint;
      while (true) {
          counter = routeObj.counter;
          if(route[counter]["t"] > time) {
                if(0 === counter) {
                  return null;
                }
                prePoint = route[counter - 1];
                nextPoint = route[counter];
                break;
              }else {
                if(counter === route.length - 1) {
                  routeObj.counter++;
                  ret.push(route[counter]);
                  return ret;
                } else {
                    ret.push(route[counter]);
                    routeObj.counter++;
                }
               /* prePoint = route[counter];
                nextPoint = route[counter + 1];*/

              }
      }
      ret.push(this.computeMidPoint(prePoint, nextPoint, time));
      return ret;
    },
    /**
     * 根据前一个轨迹点和后一个轨迹点的坐标和时间，根据传入的时间计算中间的轨迹点坐标
     * @param prePoint
     * @param nextPoint
     * @param time
     * @returns
     */
    computeMidPoint:function(prePoint, nextPoint, time) {
      if(!prePoint || !nextPoint || !time) {
        return null;
      }
      var d = (time - prePoint["t"]) / (nextPoint["t"] - prePoint["t"]);
      return{"x":prePoint["x"] + (nextPoint["x"] - prePoint["x"]) * d, "y":prePoint["y"] + (nextPoint["y"] - prePoint["y"]) * d, "t":time};
    },
    /**
     * 设定播放器的TimeSpan，改变播放器获取数据的时间频率，timeSpan越小，轨迹播放越平滑但CPU占用率越高。
     * @expose
     * @param timeSpan {Number} timeSpan
     */
    setTimeSpan:function(timeSpan) {
        if (!this.player) return;
        this.player.setTimeSpan(timeSpan);
    },
    /**
     * 设定播放器的unitTime，改变每个timeSpan对应的真实事件，unitTime越大，播放速度越快
     * @expose
     * @param unitTime {Number} unitTime
     */
    setUnitTime:function(unitTime) {
        if (!this.player) return;
        this.player.setUnitTime(unitTime);
    },
    /**
     * 获取播放器的timeSpan
     * @expose
     * @returns {Number}
     */
    getTimeSpan:function() {
        if (!this.player) return null;
        return this.player.timeSpan;
    },
    /**
     * 获取播放器的unitTime
     * @expose
     * @returns {Number}
     */
    getUnitTime:function() {
        if (!this.player) return null;
        return this.player.unitTime;
    }
});
