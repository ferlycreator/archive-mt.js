/**
 * 编辑工具类
 * @class maptalks.Editor
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z.Editor=Z.Class.extend({
    includes: [Z.Eventable],

    editStageLayerId : Z.internalLayerPrefix+'_edit_stage',

    editHandleFill : '#d0d2d6',

    /**
     * @constructor
     * @param {maptalks._shadow} geometry 待编辑图形
     * @param {Object} opts 属性
     */
    initialize:function(geometry,opts) {
        this._geometry = geometry;
        if (!this._geometry) {return;}
        Z.Util.setOptions(this, opts);
    },

    getMap:function() {
        return this._geometry.getMap();
    },

    prepare:function() {
        var map=this.getMap();
        if (!map) {return;}
        /**
         * 保存原有的symbol
         */
        if (this.options['symbol']) {
            this._originalSymbol=this._geometry.getSymbol();
            this._geometry.setSymbol(this.options['symbol']);
        }

        this._editHandles = [];
        this._prepareEditStageLayer();
    },

    _prepareEditStageLayer:function() {
        var map=this.getMap();
        this._editStageLayer = map.getLayer(this.editStageLayerId);
        if (!this._editStageLayer) {
            this._editStageLayer = new Z.VectorLayer(this.editStageLayerId);
            map.addLayer(this._editStageLayer);
        }
    },

    /**
     * 开始编辑
     */
    start:function() {
        if (!this._geometry || !this._geometry.getMap() || this._geometry.editing) {return;}
        this.editing = true;
        var geometry = this._geometry;
        this.prepare();
        //edits are applied to a shadow of geometry to improve performance.
        var shadow = geometry.copy();
        shadow.setId(null).config({'draggable': true, 'cursor' : 'move'});
        shadow.isEditing=function() {
            return  true;
        };
        shadow.on('dragstart', this._onShadowDragStart, this);
        shadow.on('dragend', this._onShadowDragEnd, this);
        this._shadow = shadow;
        geometry.hide();
        if (geometry instanceof Z.Marker || geometry instanceof Z.Circle || geometry instanceof Z.Rectangle
                || geometry instanceof Z.Ellipse) {
            //ouline has to be added before shadow to let shadow on top of it, otherwise shadow's events will be overrided by outline
            this._createOutline();
        }
        this._editStageLayer.bringToFront().addGeometry(shadow);
        if (geometry instanceof Z.Marker) {
            this.createMarkerEditor();
        } else if (geometry instanceof Z.Circle) {
            this.createCircleEditor();
        } else if (geometry instanceof Z.Rectangle) {
            this.createEllipseOrRectEditor();
        } else if (geometry instanceof Z.Ellipse) {
            this.createEllipseOrRectEditor();
        } else if (geometry instanceof Z.Sector) {
            // TODO: createSectorEditor
        } else if ((geometry instanceof Z.Polygon) ||
                   (geometry instanceof Z.Polyline)){
            this.createPolygonEditor();
        }

    },

    /**
     * 结束编辑
     * @return {[type]} [description]
     */
    stop:function() {
        var map = this.getMap();
        if (!map) {
            return;
        }
        if (this._shadow) {
            this._update();
            this._shadow.remove();
            delete this._shadow;
        }

        if (this._shadowOfShadow) {
            this._shadowOfShadow.remove();
            delete this._shadowOfShadow;
        }
        this._geometry.show();
        this._editStageLayer.removeGeometry(this._editHandles);
        this._editHandles = [];
        this._refreshHooks = [];
        if (this.options['symbol']) {
            this._geometry.setSymbol(this._originalSymbol);
            delete this._originalSymbol;
        }
        this.editing = false;
    },

    isEditing:function() {
        if (Z.Util.isNil(this.editing)) {
            return false;
        }
        return this.editing;
    },

    _onShadowDragStart:function() {
        //clone another shadow to stay where it was.
        this._shadowOfShadow = this._shadow.copy();
        this._shadowOfShadow.isEditing = function() {
            return true;
        };
        this._editStageLayer.addGeometry(this._shadowOfShadow);
        var symbol = this._shadow.getSymbol();
        //reduce shadow's opacity when dragging it.
        if (Z.Util.isNumber(symbol['opacity'])) {
            symbol['opacity'] *= 0.4;
        } else {
            symbol['opacity'] = 0.4;
        }
        this._shadow.setSymbol(symbol);

    },

    _onShadowDragEnd:function() {
        var symbol=this._shadowOfShadow.getSymbol();
        this._shadowOfShadow.remove();
        delete this._shadowOfShadow;
        this._shadow.setSymbol(symbol);

        this._update();
        this._refresh();
    },

    _update:function() {
        //update geodesic properties from shadow to geometry
        this._geometry.setCoordinates(this._shadow.getCoordinates());
        if (this._geometry.getRadius) {
            this._geometry.setRadius(this._shadow.getRadius());
        }
        if (this._geometry.getWidth) {
            this._geometry.setWidth(this._shadow.getWidth());
        }
        if (this._geometry.getHeight) {
            this._geometry.setHeight(this._shadow.getHeight());
        }
        if (this._geometry.getStartAngle) {
            this._geometry.setStartAngle(this._shadow.getStartAngle());
        }
        if (this._geometry.getEndAngle) {
            this._geometry.setEndAngle(this._shadow.getEndAngle());
        }
    },

    fireEditEvent:function(eventName) {
        if (!this._shadow) {
            return;
        }
        this._update();
        this._geometry.fire(eventName);
    },

    /**
     * create rectangle outline of the geometry
     */
    _createOutline:function() {
        var me = this,
            geometry = this._geometry,
            map = this.getMap();
        var outline;
        var fnResizeOutline = function() {
            var pixelExtent = geometry._getPainter().getPixelExtent(),
                size = pixelExtent.getSize();
            var nw = map.viewPointToCoordinate(pixelExtent.getMin());
            var width = map.pixelToDistance(size['width'],0),
                height = map.pixelToDistance(0,size['height']);
            if (!outline) {
                outline = new Z.Rectangle(nw, width, height, {
                    "symbol":{
                        'lineWidth' : 1,
                        'lineColor' : '6b707b'
                    }
                });
                me._editStageLayer.addGeometry(outline);
                me._appendHandler(outline);
            } else {
                outline.setCoordinates(nw);
                outline.setWidth(width);
                outline.setHeight(height);
            }
        };

        fnResizeOutline();
        // outline._editOnRefresh = fnResizeOutline;
        this._addRefreshHook(fnResizeOutline);
        return outline;
    },

    createHandleInstance:function(coordinate,opts) {
        var symbol = {
            "markerType"        : opts['markerType'],
            "markerFill"        : "#ffffff",//"#d0d2d6",
            "markerLineColor"   : "#000000",
            "markerLineWidth"   : 2,
            "markerWidth"       : 10,
            "markerHeight"      : 10,
            "markerDx"          : opts['dxdy'].x,
            "markerDy"          : opts['dxdy'].y
        };
        if (opts['symbol']) {
            Z.Util.extend(symbol, opts['symbol']);
        }
        var handle = new Z.Marker(coordinate,{
            'draggable' : true,
            'draggableAxis' : opts['axis'],
            'cursor'    : opts['cursor'],
            'symbol'    : symbol
        });
        return handle;
    },

    createHandle:function(coordinate, opts) {
        if (!opts) {
            opts = {};
        }
        var map = this.getMap();
        var handle = this.createHandleInstance(coordinate,opts);
        var me = this;
        function onHandleDragstart(param) {
            if (opts.onDown) {
                opts.onDown.call(me, map._containerPointToViewPoint(param['containerPoint']));
            }
        }
        function onHandleDragging(param) {
            me._hideContext();
            if (opts.onMove) {
                opts.onMove.call(me, map._containerPointToViewPoint(param['containerPoint']));
            }
        }
        function onHandleDragEnd(ev) {
            if (opts.onUp) {
                opts.onUp.call(me);
            }
        }
        handle.on('dragstart', onHandleDragstart, this);
        handle.on('dragging', onHandleDragging, this);
        handle.on('dragend', onHandleDragEnd, this);
        //拖动移图
        if (opts.onRefresh) {
            handle['maptalks--editor-refresh-fn'] = opts.onRefresh;
        }
        // this._appendHandler(handle, opts);
        this._editStageLayer.addGeometry(handle);
        return handle;
    },

    /**
     * create resize handles for geometry that can resize.
     * @param {Array} blackList handle indexes that doesn't display, to prevent change a geometry's coordinates
     * @param {fn} onHandleMove callback
     */
    _createResizeHandles:function(blackList, onHandleMove) {
        //cursor styles.
        var cursors = [
            'nw-resize','n-resize','ne-resize',
            'w-resize',            'e-resize',
            'sw-resize','s-resize','se-resize'
        ];
        //defines draggableAxis of resize handle
        var axis = [
            null, 'y', null,
            'x',       'x',
            null, 'y', null
        ];
        var geometry = this._shadow;
        function getResizeAnchors(ext) {
            return [
                ext.getMin(),
                new Z.Point((ext['xmax']+ext['xmin'])/2,ext['ymin']),
                new Z.Point(ext['xmax'], ext['ymin']),
                new Z.Point(ext['xmin'], (ext['ymax']+ext['ymin'])/2),
                new Z.Point(ext['xmax'], (ext['ymax']+ext['ymin'])/2),
                new Z.Point(ext['xmin'], ext['ymax']),
                new Z.Point((ext['xmax']+ext['xmin'])/2,ext['ymax']),
                ext.getMax()
            ];
        }
        if (!blackList) {
            blackList = [];
        }
        var resizeHandles = [];
        var anchorIndexes = {};
        var me = this, map = this.getMap();
        var fnLocateHandles = function() {
            var pExt = geometry._getPainter().getPixelExtent(),
                anchors = getResizeAnchors(pExt);
            for (var i = anchors.length - 1; i >= 0; i--) {
                //ignore anchors in blacklist
                if (Z.Util.isArrayHasData(blackList)) {
                    var isBlack = false;
                    for (var ii = blackList.length - 1; ii >= 0; ii--) {
                        if (blackList[ii] === i) {
                            isBlack = true;
                            break;
                        }
                    }
                    if (isBlack) {
                        continue;
                    }
                }
                var anchor = anchors[i],
                    coordinate = map.viewPointToCoordinate(anchor);
                if (resizeHandles.length < anchors.length - blackList.length) {
                    var handle = me.createHandle(coordinate,{
                        'markerType' : 'square',
                        'dxdy'       : new Z.Point(0,0),
                        'cursor'     : cursors[i],
                        'axis'       : axis[i],
                        onMove:(function(_index) {
                            return function(handleViewPoint) {
                                onHandleMove(handleViewPoint, _index);
                            };
                        })(i),
                        onUp:function() {
                            me._refresh();
                        }
                    });
                    anchorIndexes[i] = resizeHandles.length;
                    resizeHandles.push(handle);
                    me._appendHandler(handle);
                } else {
                    resizeHandles[anchorIndexes[i]].setCoordinates(coordinate);
                }
            }

        };

        fnLocateHandles();
        //refresh hooks to refresh handles' coordinates
        this._addRefreshHook(fnLocateHandles);
    },

    /**
     * 标注和自定义标注编辑器
     */
    createMarkerEditor:function() {
        var marker = this._shadow,
            geometryToEdit = this._geometry;
        //only image marker and vector marker can be edit now.
        if (marker._canEdit()) {
            var symbol = marker.getSymbol();
            var dxdy = new Z.Point(0,0);
            if (Z.Util.isNumber(symbol['markerDx'])) {
                dxdy.x = symbol['markerDx'];
            }
            if (Z.Util.isNumber(symbol['markerDy'])) {
                dxdy.y = symbol['markerDy'];
            }

            var blackList = null;

            if (Z.VectorMarkerSymbolizer.test(geometryToEdit, symbol)) {
                if (symbol['markerType'] === 'pin' || symbol['markerType'] === 'pie' || symbol['markerType'] === 'bar') {
                    //as these types of markers' anchor stands on its bottom, hide southern resize handles to prevent
                    //any change of coordinates when resizing it.
                    blackList = [5,6,7];
                }
            }

            //defines what can be resized by the handle
            //0: resize width; 1: resize height; 2: resize both width and height.
            var resizeAbilities = [
                2, 1, 2,
                0,    0,
                2, 1, 2
            ];

            this._createResizeHandles(blackList,function(handleViewPoint, i) {
                var viewCenter = marker._getCenterViewPoint().add(dxdy),
                    symbol = marker.getSymbol();
                var wh = handleViewPoint.substract(viewCenter);
                //if this marker's anchor is on its bottom, height doesn't need to multiply by 2.
                var r = blackList?1:2;
                var width = Math.abs(wh.x)*2,
                    height = Math.abs(wh.y)*r;
                var ability = resizeAbilities[i];
                if (ability === 0 || ability === 2) {
                    symbol['markerWidth'] = width;
                }
                if (ability === 1 || ability === 2) {
                    symbol['markerHeight'] = height;
                }
                marker.setSymbol(symbol);
                geometryToEdit.setSymbol(symbol);
            });

        }
    },

    /**
     * 圆形编辑器
     * @return {[type]} [description]
     */
    createCircleEditor:function() {
        var shadow = this._shadow,
            circle = this._geometry;
        var map = this.getMap();
        var me = this;
        this._createResizeHandles(null,function(handleViewPoint, i) {
            var viewCenter = shadow._getCenterViewPoint();
            var wh = handleViewPoint.substract(viewCenter);
            var w = Math.abs(wh.x),
                h = Math.abs(wh.y);
            var r;
            if (w > h) {
                r = map.pixelToDistance(w, 0);
            } else {
                r = map.pixelToDistance(0, h);
            }
            shadow.setRadius(r);
            circle.setRadius(r);
            me.fireEditEvent('shapechanging');
        });
    },

    /**
     * editor of ellipse or rectangle
     * @return {[type]} [description]
     */
    createEllipseOrRectEditor:function() {
        //defines what can be resized by the handle
        //0: resize width; 1: resize height; 2: resize both width and height.
        var resizeAbilities = [
                2, 1, 2,
                0,    0,
                2, 1, 2
            ];
        var shadow = this._shadow,
            ellipse = this._geometry;
        var map = this.getMap();
        var me = this;
        var blackList = null;
        var isRect = this._geometry instanceof Z.Rectangle;
        if (isRect) {
            //resize handles to hide for rectangle
            blackList = [0,1,2,3,5];
        }
        this._createResizeHandles(blackList,function(handleViewPoint, i) {
            var viewCenter;
            //ratio of width and height
            var r;
            if (isRect) {
                r = 1;
                viewCenter = map._transformToViewPoint(shadow._getPNw());
            } else {
                r = 2;
                viewCenter = shadow._getCenterViewPoint();
            }
            var wh = handleViewPoint.substract(viewCenter);
            var ability = resizeAbilities[i];
            var w = map.pixelToDistance(Math.abs(wh.x), 0);
            var h = map.pixelToDistance(0,Math.abs(wh.y));
            if (ability === 0 || ability === 2) {
                shadow.setWidth(w*r);
                ellipse.setWidth(w*r);
            }
            if (ability === 1 || ability === 2) {
                shadow.setHeight(h*r);
                ellipse.setHeight(h*r);
            }
            me.fireEditEvent('shapechanging');
        });
    },

    /**
     * 多边形和多折线的编辑器
     * @return {[type]} [description]
     */
    createPolygonEditor:function() {

        var map = this.getMap(),
            shadow = this._shadow,
            me = this,
            projection = map._getProjection();
        var verticeLimit = shadow instanceof Z.Polygon? 3:2;
        var propertyOfVertexRefreshFn = 'maptalks--editor-refresh-fn',
            propertyOfVertexIndex = 'maptalks--editor-vertex-index';
        var vertexHandles = [],
            newVertexHandles = [];
        function getVertexCoordinates() {
            if (shadow instanceof Z.Polygon) {
                return shadow.getCoordinates()[0];
            } else {
                return shadow.getCoordinates();
            }

        }
        function getVertexPrjCoordinates() {
            return shadow._getPrjPoints();
        }
        function onVertexAddOrRemove() {
            //restore index property of each handles.
            var i;
            for (i = vertexHandles.length - 1; i >= 0; i--) {
                vertexHandles[i][propertyOfVertexIndex] = i;
            }
            for (i = newVertexHandles.length - 1; i >= 0; i--) {
                newVertexHandles[i][propertyOfVertexIndex] = i;
            }
        }

        function removeVertex(param) {
            var handle = param['target'],
                index = handle[propertyOfVertexIndex];
            var prjCoordinates = getVertexPrjCoordinates();
            if (prjCoordinates.length <= verticeLimit) {
                return;
            }
            prjCoordinates.splice(index,1);
            shadow._setPrjPoints(prjCoordinates);
            shadow._updateCache();
            //remove vertex handle
            Z.Util.removeFromArray(vertexHandles.splice(index,1)[0].remove(),me._editHandles);
            //remove two neighbor "new vertex" handles
            if (index < newVertexHandles.length) {
                Z.Util.removeFromArray(newVertexHandles.splice(index,1)[0].remove(),me._editHandles);
            }
            var nextIndex;
            if (index === 0){
                nextIndex = newVertexHandles.length-1;
            } else {
                nextIndex = index - 1;
            }
            Z.Util.removeFromArray(newVertexHandles.splice(nextIndex,1)[0].remove(),me._editHandles);
            //add a new "new vertex" handle.
            newVertexHandles.splice(nextIndex,0,createNewVertexHandle.call(me, nextIndex));
            onVertexAddOrRemove();
        }
        function moveVertexHandle(handleViewPoint, index) {
            var vertice = getVertexPrjCoordinates();
            var nVertex = map._untransformFromViewPoint(handleViewPoint);
            var pVertex = vertice[index];
            pVertex.x = nVertex.x;
            pVertex.y = nVertex.y;
            shadow._updateCache();
            shadow._onShapeChanged();
            var nextIndex;
            if (index === 0) {
                nextIndex = newVertexHandles.length-1;
            } else {
                nextIndex = index - 1;
            }
            //refresh two neighbor "new vertex" handles.
            if (newVertexHandles[index]) {
                newVertexHandles[index][propertyOfVertexRefreshFn]();
            }
            if (newVertexHandles[nextIndex]) {
                newVertexHandles[nextIndex][propertyOfVertexRefreshFn]();
            }

            me.fireEditEvent('shapechanging');
        }
        function createVertexHandle(index) {
            var vertex = getVertexCoordinates()[index];
            var handle = me.createHandle(vertex,{
                'markerType' : 'square',
                'dxdy'       : new Z.Point(0,0),
                'cursor'     : 'pointer',
                'axis'       : null,
                onMove:function(handleViewPoint) {
                    moveVertexHandle(handleViewPoint,handle[propertyOfVertexIndex]);
                },
                onRefresh:function() {
                    vertex = getVertexCoordinates()[handle[propertyOfVertexIndex]];
                    handle.setCoordinates(vertex);
                }
            });
            handle[propertyOfVertexIndex] = index;
            handle.on('contextmenu', removeVertex);
            return handle;
        }
        function createNewVertexHandle(index) {
            var vertexCoordinates = getVertexCoordinates();
            var vertex = vertexCoordinates[index].add(vertexCoordinates[index+1]).multi(1/2);
            var handle = me.createHandle(vertex,{
                'markerType' : 'square',
                'symbol'     : {'opacity' : 0.4},
                'dxdy'       : new Z.Point(0,0),
                'cursor'     : 'pointer',
                'axis'       : null,
                onDown:function() {
                    var prjCoordinates = getVertexPrjCoordinates();
                    var vertexIndex = handle[propertyOfVertexIndex];
                    //add a new vertex
                    var pVertex = projection.project(handle.getCoordinates());
                    //update shadow's vertice
                    prjCoordinates.splice(vertexIndex+1,0,pVertex);
                    shadow._setPrjPoints(prjCoordinates);
                    shadow._updateCache();

                    var symbol = handle.getSymbol();
                    delete symbol['opacity'];
                    handle.setSymbol(symbol);

                    //add two "new vertex" handles
                    newVertexHandles.splice(vertexIndex,0, createNewVertexHandle.call(me, vertexIndex),createNewVertexHandle.call(me, vertexIndex+1));
                    me.fireEditEvent('shapechanged');
                },
                onMove:function(handleViewPoint) {
                    moveVertexHandle(handleViewPoint,handle[propertyOfVertexIndex]+1);
                },
                onUp:function() {
                    var vertexIndex = handle[propertyOfVertexIndex];
                    //remove this handle
                    Z.Util.removeFromArray(handle, newVertexHandles);
                    Z.Util.removeFromArray(handle, me._editHandles);
                    handle.remove();
                    //add a new vertex handle
                    vertexHandles.splice(vertexIndex+1,0,createVertexHandle.call(me,vertexIndex+1));
                    onVertexAddOrRemove();
                },
                onRefresh:function() {
                    vertexCoordinates = getVertexCoordinates();
                    var vertexIndex = handle[propertyOfVertexIndex];
                    var nextIndex;
                    if (vertexIndex === newVertexHandles.length - 1) {
                        nextIndex = 0;
                    } else {
                        nextIndex = vertexIndex + 1;
                    }
                    var refreshVertex = vertexCoordinates[vertexIndex].add(vertexCoordinates[vertexIndex+1]).multi(1/2);
                    handle.setCoordinates(refreshVertex);
                }
            });
            handle[propertyOfVertexIndex] = index;
            return handle;
        }
        var vertexCoordinates = getVertexCoordinates();
        for (var i=0,len=vertexCoordinates.length;i<len;i++){
            vertexHandles.push(createVertexHandle.call(this,i));
            if (i<len-1) {
                newVertexHandles.push(createNewVertexHandle.call(this,i));
            }
        }
        this._appendHandler(newVertexHandles);
        this._appendHandler(vertexHandles);
        this._addRefreshHook(function() {
            var i;
            for (i = newVertexHandles.length - 1; i >= 0; i--) {
                newVertexHandles[i][propertyOfVertexRefreshFn]();
            }
            for (i = vertexHandles.length - 1; i >= 0; i--) {
                vertexHandles[i][propertyOfVertexRefreshFn]();
            }
        });
    },

    _refresh:function() {
        if (this._refreshHooks) {
            for (var i = this._refreshHooks.length - 1; i >= 0; i--) {
                this._refreshHooks[i].call(this);
            }
        }
    },

    _hideContext:function() {
        if (this._geometry) {
            this._geometry.closeMenu();
            this._geometry.closeInfoWindow();
        }
    },

    _addRefreshHook:function(fn) {
        if (!fn) {
            return;
        }
        if (!this._refreshHooks) {
            this._refreshHooks = [];
        }
        this._refreshHooks.push(fn);
    },

    _appendHandler:function(handle){
        if (!handle) {
            return;
        }
        if (!this._editHandles) {
            this._editHandles = [];
        }
        this._editHandles.push(handle);

    }

});
