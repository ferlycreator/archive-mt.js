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
    defaultStrokeSymbol: {
            'lineColor':'#474cf8',
            'lineWidth':2,
            'lineOpacity':1,
            'lineDasharray': '',
            'polygonFill' : '#ffffff',
            'polygonOpacity' : 1
    },

    addTo: function(map) {
        //TODO options应该设置到this.options中
        this.map = map;
        if (!this.map) {return;}
        this._tileConfig = map._getTileConfig();
        this.enable();
        return this;
    },

    /**
     * 激活
     * @expose
     */
    enable:function() {
        if (!this.map) {return;}
        this.drawToolLayer = this._getDrawLayer();
        this._clearEvents();
        this._registerEvents();
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
        this._endDraw();
        this.map.removeLayer(this._getDrawLayer());
        this._clearEvents();
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
        this.mode = mode;
        this._clearEvents();
        this._registerEvents();
    },

    /**
     * 获得drawtool的绘制样式
     * @return {Object} [绘制样式]
     * @expose
     */
    getSymbol:function() {
        var symbol = this.symbol;
        if(symbol) {
            this.symbol = Z.Util.convertFieldNameStyle(symbol, 'camel');
            return this.symbol;
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
        this.symbol = symbol;
        if (this.geometry) {
            this.geometry.setSymbol(symbol);
        }
    },

    _getProjection:function() {
        if (!this._tileConfig) {
            return null;
        }
        return this._tileConfig.getProjectionInstance();
    },

    /**
     * 注册鼠标响应事件
     */
    _registerEvents: function() {
        this._preventEvents();
        var mode = this.mode;
        if (Z.Util.isNil(mode)) {
            mode = Z.Geometry['TYPE_CIRCLE'];
        }
        if (Z.Geometry['TYPE_POLYGON'] == mode || Z.Geometry['TYPE_LINESTRING'] == mode) {
            this.map.on('click',this._clickForPath, this);
            this.map.on('mousemove',this._mousemoveForPath,this);
            this.map.on('dblclick',this._dblclickForPath,this);
        } else if (Z.Geometry['TYPE_POINT'] == mode) {
            this.map.on('click',this._clickForPoint, this);
        } else {
            this.map.on('mousedown',this._mousedownToDraw, this);
        }
    },

    _preventEvents: function() {
        this.map.disableDrag();
        this.map['doubleClickZoom'] = false;
    },

    _clearEvents: function() {
        this.map.off('click',this._clickForPath, this);
        this.map.off('click',this._clickForPoint, this);
        this.map.off('mousemove',this._mousemoveForPath,this);
        this.map.off('dblclick',this._dblclickForPath,this);
        this.map.off('mousedown',this._mousedownToDraw,this);
        this.map.enableDrag();
        this.map['doubleClickZoom'] = true;
    },

    _clickForPoint: function(event) {
        var screenXY = this._getMouseScreenXY(event);
        var coordinate = this._screenXYToLonlat(screenXY);
        var param = {'coordinate':coordinate, 'pixel':screenXY};
        if(this.afterdraw){
            this.afterdraw(param);
        }
        this._fireEvent('afterdraw', param);
        if(this.afterdrawdisable) {
           this.disable();
        }
    },

    _clickForPath:function(event) {
        var screenXY = this._getMouseScreenXY(event);
        var coordinate = this._screenXYToLonlat(screenXY);
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
            var path = this._getLonlats();
            path.push(coordinate);
            //这一行代码取消注册后, 会造成dblclick无法响应, 可能是存在循环调用,造成浏览器无法正常响应事件
            // this._setLonlats(path);
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

    _mousemoveForPath : function(event) {
        if (!this.geometry) {return;}
        var screenXY = this._getMouseScreenXY(event);
        if (!this._isValidScreenXY(screenXY)) {return;}
        var coordinate = this._screenXYToLonlat(screenXY);
        var drawLayer = this._getDrawLayer();
        var path = this._getLonlats();
        if (path.length === 1) {
            path.push(coordinate);
             drawLayer.addGeometry(this.geometry);
        } else {
            path[path.length-1] = coordinate;
            //path.push(coordinate);
        }
        // this.drawToolLayer.removeGeometry(this.geometry);
        this._setLonlats(path);
        // this.drawToolLayer.addGeometry(this.geometry);
    },

    _dblclickForPath:function(event) {
        if (!this.geometry) {return;}
        var screenXY = this._getMouseScreenXY(event);
        if (!this._isValidScreenXY(screenXY)) {return;}
        var coordinate = this._screenXYToLonlat(screenXY);
        var path = this._getLonlats();
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

            this.geometry = new Z.Polygon([path]);
            var symbol=this.getSymbol();
            if (symbol) {
                this.geometry.setSymbol(symbol);
            }
            this.drawToolLayer.addGeometry(this.geometry);
        } else {
            this.geometry.setCoordinates(path);
        }
        //<--
        this._endDraw(coordinate, screenXY);
    },

    _mousedownToDraw : function(event) {
        var me = this;
        var onMouseUp;
        function genGeometry(coordinate) {
            var symbol = me.getSymbol();
            var geometry = me.geometry;
            var drawLayer = me._getDrawLayer();
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
                var nw =geometry.getCoordinates();
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
            var screenXY = this._getMouseScreenXY(_event);
            if (!this._isValidScreenXY(screenXY)) {return;}
            var coordinate = this._screenXYToLonlat(screenXY);
            genGeometry(coordinate);
            return false;
        }
        onMouseUp = function(_event) {
            if (!this.geometry) {
                return false;
            }
            var screenXY = this._getMouseScreenXY(_event);
            if (!this._isValidScreenXY(screenXY)) {return;}
            var coordinate = this._screenXYToLonlat(screenXY);
            genGeometry(coordinate);
            this.map.off('mousemove',onMouseMove, this);
            this.map.off('mouseup',onMouseUp, this);
            this._endDraw(coordinate, screenXY);
            return false;
        };
        var screenXY = this._getMouseScreenXY(event);
        if (!this._isValidScreenXY(screenXY)) {return;}
        var coordinate = this._screenXYToLonlat(screenXY);
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

    _endDraw : function(coordinate, screenXY) {
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
         var param = {'target':target,'coordinate':target.getCoordinates(), 'pixel':screenXY};
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
    _getLonlats:function() {
        if (this.geometry.getShell) {
            return this.geometry.getShell();
        }
        return this.geometry.getCoordinates();
    },

    _setLonlats:function(lonlats) {
        if (this.geometry instanceof Z.Polygon) {
            this.geometry.setCoordinates([lonlats]);
        } else if (this.geometry instanceof Z.Polyline) {
            this.geometry.setCoordinates(lonlats);
        }
    },

    /**
     * 获得鼠标事件在地图容器上的屏幕坐标
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    _getMouseScreenXY:function(event) {
        Z.DomUtil.stopPropagation(event);
        var result = Z.DomUtil.getEventDomCoordinate(event,this.map._containerDOM);
        return result;
    },

    /**
     * 事件坐标转化为地图上的经纬度坐标
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    _screenXYToLonlat:function(screenXY) {
        var projection = this._getProjection(),
            map = this.map;

        //projected pLonlat
        var pLonlat = map._untransform(screenXY);
        return projection.unproject(pLonlat);
    },

    _isValidScreenXY:function(screenXY) {
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

    _getDrawLayer:function() {
        var drawLayerId = '____system_layer_drawtool';
        var drawToolLayer = this.map.getLayer(drawLayerId);
        if (!drawToolLayer) {
            drawToolLayer = new Z.VectorLayer(drawLayerId);
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
