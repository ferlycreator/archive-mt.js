Z['DrawTool'] = Z.DrawTool = Z.Class.extend({
    includes: [Z.Eventable],
    /**
    * 初始化绘制工具
    * options:{mode:Z.Geometry.TYPE_CIRCLE, afterdraw: fn, afterdrawdisable: true}
    */
    initialize: function(options, map) {
        Z.Util.extend(this, options);
        if(map) {
            this.addTo(map);
        }
        return this;
    },
    /**
     * 默认的线型
     * @type {Object}
     */
    defaultStrokeSymbol:{'strokeSymbol' : {'stroke':'#474cf8', 'strokeWidth':3, 'strokeOpacity':1}},

    addTo: function(map) {
        this.map = map;
        if (!this.map) {return;}
        this.lodConfig = map._getLodConfig();
        this.enable();
        return this;
    },

    /**
     * 激活
     * @expose
     */
    enable:function() {
        if (!this.map) {return;}
        this.drawToolLayer = this.getDrawLayer();
        this.clearEvents();
        this.registerEvents();
        return this;
    },

    /**
     * 停止激活
     * @expose
     */
    disable:function() {
        if (!this.map) {
            return;
        }
        this.endDraw();
        this.map.removeLayer(this.getDrawLayer());
        this.clearEvents();
    },

    /**
     * 设置绘图模式
     * @param {Number} [node] [绘图模式]
     * @expose
     */
    setMode:function(mode) {
        if (this.geometry) {
            this.geometry.remove();
            delete this.geometry;
        }
        this['mode'] = mode;
        this.clearEvents();
        this.registerEvents();
    },

    /**
     * 获得drawtool的绘制样式
     * @return {Object} [绘制样式]
     * @expose
     */
    getSymbol:function() {
        if(this['symbol']) {
            return this['symbol'];
        } else {
            return this.defaultStrokeSymbol;
        }
    },

    /**
     * 设置drawtool的绘制样式
     * @param {Object} symbol [绘制样式]
     */
    setSymbol:function(symbol) {
        if (!symbol) {
            return;
        }
        this['symbol'] = symbol;
        if (this.geometry) {
            this.geometry.setSymbol(symbol);
        }
    },

    _getProjection:function() {
        if (!this.lodConfig) {
            return null;
        }
        return this.lodConfig.getProjectionInstance();
    },

    /**
     * 注册鼠标响应事件
     */
    registerEvents: function() {
        this.preventEvents();
        var mode = this['mode'];
        if (Z.Util.isNil(mode)) {
            mode = Z.Geometry['TYPE_CIRCLE'];
        }
        if (Z.Geometry['TYPE_POLYGON'] == mode || Z.Geometry['TYPE_POLYLINE'] == mode) {
            this.map.on('click',this.clickForPath, this);
            this.map.on('mousemove',this.mousemoveForPath,this);
            this.map.on('dblclick',this.dblclickForPath,this);
        } else if (Z.Geometry['TYPE_POINT'] == mode) {
            this.map.on('click',this.clickForPoint, this);
        } else {
            this.map.on('mousedown',this.mousedownToDraw, this);
        }
    },

    preventEvents: function() {
        this.map.disableDragPropagation();
        this.map['doubleClickZoom'] = false;
    },

    clearEvents: function() {
        this.map.off('click',this.clickForPath, this);
        this.map.off('click',this.clickForPoint, this);
        this.map.off('mousemove',this.mousemoveForPath,this);
        this.map.off('dblclick',this.dblclickForPath,this);
        this.map.off('mousedown',this.mousedownToDraw,this);
        this.map.enableDragPropagation();
        this.map['doubleClickZoom'] = true;
    },

    clickForPoint: function(event) {
        var screenXY = this.getMouseScreenXY(event);
        var coordinate = this.screenXYToLonlat(screenXY);
        var param = {'coordinate':coordinate, 'pixel':screenXY};
        if(this.afterdraw){
            this.afterdraw(param);
        }
        this._fireEvent('afterdraw', param);
        if(this.afterdrawdisable) {
           this.disable();
        }
    },

    clickForPath:function(event) {
        var screenXY = this.getMouseScreenXY(event);
        var coordinate = this.screenXYToLonlat(screenXY);
        if (!this.geometry) {
            //无论画线还是多边形, 都是从线开始的
            this.geometry = new Z.Polyline([coordinate]);
            var symbol = this.getSymbol();
            if (symbol) {
                this.geometry.setSymbol(symbol);
            }
            /**
            * 绘制开始事件
            * @event startdraw
            * @param coordinate {seegoo.maps.MLonLat} 初始坐标
            * @param pixel {Pixel} 初始像素坐标
            */
            this._fireEvent('startdraw', {'coordinate':coordinate,'pixel':screenXY});
        } else {
            var path = this.getLonlats();
            path.push(coordinate);
            //这一行代码取消注册后, 会造成dblclick无法响应, 可能是存在循环调用,造成浏览器无法正常响应事件
            // this.setLonlats(path);
            if (this.map.hasListeners('drawring')) {
                /**
                 * 端点绘制事件，当为多边形或者多折线绘制了一个新的端点后会触发此事件
                 * @event drawring
                 * @param coordinate {seegoo.maps.MLonLat} 新端点的地理坐标
                 * @param pixel {Pixel} 新端点的像素坐标
                 */
                this._fireEvent('drawring',{'target':this.geometry,'coordinate':coordinate,'pixel':screenXY});
            }
        }
    },

    mousemoveForPath : function(event) {
        if (!this.geometry) {return;}
        var screenXY = this.getMouseScreenXY(event);
        if (!this.isValidScreenXY(screenXY)) {return;}
        var coordinate = this.screenXYToLonlat(screenXY);
        var drawLayer = this.getDrawLayer();
        var path = this.getLonlats();
        if (path.length === 1) {
            path.push(coordinate);
             drawLayer.addGeometry(this.geometry);
        } else {
            path[path.length-1] = coordinate;
            //path.push(coordinate);
        }
        // this.drawToolLayer.removeGeometry(this.geometry);
        this.setLonlats(path);
        // this.drawToolLayer.addGeometry(this.geometry);
    },

    dblclickForPath:function(event) {
        if (!this.geometry) {return;}
        var screenXY = this.getMouseScreenXY(event);
        if (!this.isValidScreenXY(screenXY)) {return;}
        var coordinate = this.screenXYToLonlat(screenXY);
        var path = this.getLonlats();
        path.push(coordinate);
        if (path.length < 2) {return;}
        //去除重复的端点
        var nIndexes = [];
        var i, len;
        for (i=1,len=path.length;i<len;i++) {
            if (path[i].x === path[i-1].x && path[i].y === path[i-1].y) {
                nIndexes.push(i);
            }
        }
        for (i=nIndexes.length-1;i>=0;i--) {
            path.splice(nIndexes[i],1);
        }

        if (path.length < 2 || (Z.Geometry['TYPE_POLYGON'] == this.mode && path.length < 3)) {
            return;
        }
        this.geometry.remove();
        //-->2014-10-28 增加只在双击时才封闭多边形
        if (Z.Geometry['TYPE_POLYGON'] == this.mode) {

            this.geometry = new Z.Polygon(path);
            var symbol=this.getSymbol();
            if (symbol) {
                this.geometry.setSymbol(symbol);
            }
            this.drawToolLayer.addGeometry(this.geometry);
        } else {
            this.geometry.setPath(path);
        }
        //<--
        this.endDraw(coordinate, screenXY);
    },

    mousedownToDraw : function(event) {
        var me = this;
        var onMouseUp;
        function genGeometry(coordinate) {
            var symbol = me.getSymbol();
            var geometry = me.geometry;
            var drawLayer = me.getDrawLayer();
            var _map = me.map;
            var center;
            switch (me.mode) {
            case Z.Geometry['TYPE_CIRCLE']:
                if (!geometry) {
                    geometry = new Z.Circle(coordinate,0);
                    geometry.setSymbol(symbol);
                    drawLayer.addGeometry(geometry);
                    break;
                }
                center =geometry.getCenter();
                var radius = _map.computeDistance(center,coordinate);
                geometry.setRadius(radius);
            break;
            case Z.Geometry['TYPE_ELLIPSE']:
                if (!geometry) {
                    geometry = new Z.Ellipse(coordinate,0,0);
                    geometry.setSymbol(symbol);
                    drawLayer.addGeometry(geometry);
                    break;
                }
                center = geometry.getCenter();
                var rx = _map.computeDistance(center,{x:coordinate.x, y:center.y});
                var ry = _map.computeDistance(center,{x:center.x, y:coordinate.y});
                geometry.setWidth(rx);
                geometry.setHeight(ry);
            break;
            case Z.Geometry['TYPE_RECT']:
                if (!geometry) {
                    geometry = new Z.Rectangle(coordinate,0,0);
                    geometry.setSymbol(symbol);
                    drawLayer.addGeometry(geometry);
                    break;
                }
                var nw =geometry.getNw();
                var width = _map.computeDistance(nw,{x:coordinate.x, y:nw.y});
                var height = _map.computeDistance(nw,{x:nw.x, y:coordinate.y});
                geometry.setWidth(width);
                geometry.setHeight(height);
            break;
            }
            me.geometry=geometry;

        }
        function onMouseMove(_event) {
            if (!this.geometry) {
                return false;
            }
            var screenXY = this.getMouseScreenXY(_event);
            if (!this.isValidScreenXY(screenXY)) {return;}
            var coordinate = this.screenXYToLonlat(screenXY);
            genGeometry(coordinate);
            return false;
        }
        onMouseUp = function(_event) {
            if (!this.geometry) {
                return false;
            }
            var screenXY = this.getMouseScreenXY(_event);
            if (!this.isValidScreenXY(screenXY)) {return;}
            var coordinate = this.screenXYToLonlat(screenXY);
            genGeometry(coordinate);
            this.map.off('mousemove',onMouseMove, this);
            this.map.off('mouseup',onMouseUp, this);
            this.endDraw(coordinate, screenXY);
            return false;
        };
        var screenXY = this.getMouseScreenXY(event);
        if (!this.isValidScreenXY(screenXY)) {return;}
        var coordinate = this.screenXYToLonlat(screenXY);
        /**
         * 绘制开始事件
         * @event startdraw
         * @param coordinate {seegoo.maps.MLonLat} 初始坐标
         * @param pixel {Pixel} 初始像素坐标
         */
        this._fireEvent('startdraw',{'coordinate':coordinate,'pixel':screenXY});
        genGeometry(coordinate);
        this.map.on('mousemove',onMouseMove,this);
        this.map.on('mouseup',onMouseUp,this);
        return false;
    },

    endDraw : function(coordinate, screenXY) {
        if (!this.geometry) {
            return;
        }
        var target = this.geometry.copy();
        this.geometry.remove();
        delete this.geometry;
         /**
         * 绘制结束事件
         * @event afterdraw
         * @param coordinate {seegoo.maps.MLonLat} 结束坐标
         * @param pixel {Pixel} 结束像素坐标
         */
         var param = {'target':target,'coordinate':coordinate, 'pixel':screenXY};
         if(this.afterdraw){
            this.afterdraw(param);
         }
         this._fireEvent('afterdraw', param);
         if(this.afterdrawdisable) {
           this.disable();
         }
    },

    /**
     * 返回多边形或多折线的坐标数组
     * @return {[type]} [description]
     */
    getLonlats:function() {
        if (this.geometry.getShell) {
            return this.geometry.getShell();
        }
        return this.geometry.getPath();
    },

    setLonlats:function(lonlats) {
        if (this.geometry instanceof Z.Polygon) {
            this.geometry.setCoordinates([lonlats]);
        } else if (this.geometry instanceof Z.Polyline) {
            this.geometry.setCoordinates(lonlats);
        }
        /*if (this.geometry.setRing) {
            this.geometry.setRing(lonlats);
        } else {
            this.geometry.setPath(lonlats);
        }*/
    },

    /**
     * 获得鼠标事件在地图容器上的屏幕坐标
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    getMouseScreenXY:function(event) {
        Z.DomUtil.stopPropagation(event);
        var result = Z.DomUtil.getEventDomCoordinate(event,this.map.containerDOM);
        return result;
    },

    /**
     * 事件坐标转化为地图上的经纬度坐标
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    screenXYToLonlat:function(screenXY) {
        var projection = this._getProjection(),
            map = this.map;

        //projected pLonlat
        var pLonlat = map._transform(screenXY);
        return projection.unproject(pLonlat);
    },

    isValidScreenXY:function(screenXY) {
        var mapSize = this.map.getSize();
        var w = mapSize['width'],
            h = mapSize['height'];
        if (screenXY['left'] < 0 || screenXY['top'] < 0) {
            return false;
        } else if (screenXY['left']> w || screenXY['top'] > h){
            return false;
        }
        return true;
    },

    getDrawLayer:function() {
        var drawLayerId = '____system_layer_drawtool';
        var drawToolLayer = this.map.getLayer(drawLayerId);
        if (!drawToolLayer) {
            drawToolLayer = new Z.SVGLayer(drawLayerId);
            this.map.addLayer(drawToolLayer);
        }
        return drawToolLayer;
    },

    _fireEvent:function(eventName, param) {
        if (!param) {
            param = {};
        }
        this.fire(eventName, param);
    }

});