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

    /**
     * @constructor
     * @param {maptalks.Geometry} geometry 待编辑图形
     * @param {Object} opts 属性
     */
    initialize:function(geometry,opts) {
        this.geometryToEdit = geometry;
        if (!this.geometryToEdit) {return;}
        //Z.Util.extend(this, opts);
        this.opts = opts;
        if (!this.opts) {
            this.opts = {};
        }
    },

    getMap:function() {
        return this.geometryToEdit.getMap();
    },

    prepare:function() {
        var map=this.getMap();
        if (!map) {return;}

        this.geoType = this.geometryToEdit.getType();
        if (!map._panels.editorContainer) {
            var editorContainer = Z.DomUtil.createEl("div");
            //editorContainer.id = "editorContainer";
            editorContainer.style.cssText="position:absolute;top:0px;left:0px;z-index:2000;";
            map._panels.mapPlatform.appendChild(editorContainer);
            map._panels.editorContainer = editorContainer;
        }

        this._container = map._panels.editorContainer;
        //保存原有的Symbol
        /**
         * 保存原有的symbol
         */
        if (this.opts['symbol']) {
            this._originalSymbol=this.geometry.getSymbol();
            this.geometryToEdit.setSymbol(this.opts['symbol']);
        }

        this.editHandlers = [];
        this._prepareEditStageLayer();
        map.on('_zoomend _moveend _resize',this.onRefreshEnd,this);
        map.on('_zoomstart',this.onRefreshStart,this);
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
        if (!this.geometryToEdit || !this.geometryToEdit.getMap() || this.geometryToEdit.editing) {return;}
        this.prepare();
        var geometry = this.geometryToEdit.copy();
        this.geometry = geometry;
        this.geometry.setId(null);
        this.geometry.isEditing=function() {
            return true;
        }
        this.geometryToEdit.hide();
        this._editStageLayer.addGeometry(geometry);
        if (geometry instanceof Z.Marker) {
            this.createMarkerEditor();
        } else if (geometry instanceof Z.Circle) {
            this.createCircleEditor();
        } else if (geometry instanceof Z.Rectangle) {
            this.createRectEditor();
        } else if (geometry instanceof Z.Ellipse) {
            this.createEllipseEditor();
        } else if (geometry instanceof Z.Sector) {
            // TODO: createSectorEditor
        } else if ((geometry instanceof Z.Polygon) ||
                   (geometry instanceof Z.Polyline)){
            this.createPolygonEditor();
        }
        this.editing = true;
    },

    /**
     * 结束编辑
     * @return {[type]} [description]
     */
    stop:function() {
        this.editing = false;
        var map = this.getMap();
        if (!map) {
            return;
        }
        if (this.geometry) {
            this._update();
            this.geometry.remove();
            delete this.geometry;
        }

        this.geometryToEdit.show();

        map.off('_zoomend', this.onRefreshEnd,this);
        map.off('_zoomstart', this.onRefreshStart,this);
        map.off('_resize', this.onRefreshEnd,this);
        for (var i=0,len=this.editHandlers.length;i<len;i++) {
            Z.DomUtil.removeDomNode(this.editHandlers[i]);
        }
        this.editHandlers=[];

        if (this.opts['symbol']) {
            this.geometryToEdit.setSymbol(this._originalSymbol);
            delete this._originalSymbol;
        }
    },

    isEditing:function() {
        if (Z.Util.isNil(this.editing)) {
            return false;
        }
        return this.editing;
    },

    _update:function() {
        this.geometryToEdit.setCoordinates(this.geometry.getCoordinates());
        if (this.geometryToEdit.getRadius) {
            this.geometryToEdit.setRadius(this.geometry.getRadius());
        }
        if (this.geometryToEdit.getWidth) {
            this.geometryToEdit.setWidth(this.geometry.getWidth());
        }
        if (this.geometryToEdit.getHeight) {
            this.geometryToEdit.setHeight(this.geometry.getHeight());
        }
        if (this.geometryToEdit.getStartAngle) {
            this.geometryToEdit.setStartAngle(this.geometry.getStartAngle());
        }
        if (this.geometryToEdit.getEndAngle) {
            this.geometryToEdit.setEndAngle(this.geometry.getEndAngle());
        }
    },

    fireEditEvent:function(eventName) {
        if (!this.geometry) {
            return;
        }
        this._update();
        this.geometryToEdit.fire(eventName);
    },

    createHandleDom:function(pixel,opts) {
        if (!opts) {
            opts = {};
        }
        var handle = Z.DomUtil.createEl("div");
        var cursorStyle = opts['cursor'];
        if (!cursorStyle) {
            cursorStyle = 'move';
        }
        handle.style.cssText="display:block;position: absolute; top:"+
            (pixel.y-5)+"px;left:"+(pixel.x-5)+"px;cursor:"+cursorStyle+";";
        handle.innerHTML='<div title="'+opts.tip+'" style="display:block;width:11px;height:11px;background:url(' + Z.prefix + 'images/dd-via.png) 0px 0px no-repeat;"></div>';
        return handle;
    },

    createHandle:function(pixel, opts) {
        if (!opts) {
            opts = {tip:''};
        }
        var map = this.getMap();
        var handle = this.createHandleDom(pixel,opts);
        var _containerDOM = map._containerDOM;
        var editor = this;
        function onMouseMoveEvent(event) {
            var ev  = ev || window.event;
            editor.hideContext();
            var mousePos = Z.DomUtil.getEventContainerPoint(ev,_containerDOM);
            var handleDomOffset = map._containerPointToViewPoint(mousePos);
            handle.style['top']=(handleDomOffset.y-5)+"px";
            handle.style['left']=(handleDomOffset.x-5)+"px";
            Z.DomUtil.stopPropagation(ev);
            if (opts.onMove) {
                opts.onMove.call(editor,handleDomOffset);
            }
            return false;
        }
        function onMouseUpEvent(event) {
            var ev  = ev || window.event;
            Z.DomUtil.off(document,'mousemove',onMouseMoveEvent);
            Z.DomUtil.off(document,'mouseup',onMouseUpEvent);
            // document.onmousemove=null;
            // document.onmouseup=null;
            Z.DomUtil.stopPropagation(ev);
            if (opts.onUp) {
                opts.onUp.call(editor);
            }
            return false;
        }
        Z.DomUtil.addDomEvent(handle,'mousedown',function(event) {

            if (opts.onDown) {
                opts.onDown.call(editor);
            }
            //鼠标拖动操作
            Z.DomUtil.on(document,'mouseup',onMouseUpEvent);
            Z.DomUtil.on(document,'mousemove',onMouseMoveEvent);
            Z.DomUtil.stopPropagation(event);

            return false;
        },this);
        //拖动移图
        this.appendHandler(handle,opts);
        // handle.onRefresh = opts['onRefresh'];
        return handle;
    },

    /**
     * 创建中心点编辑
     * @return {[type]} [description]
     */
    createCenterEditor:function(opts){
        if (!opts) {
            opts = {};
        }
        var geometry = this.geometry;
        var map = this.getMap();
        var pxCenter = map._transformToViewPoint(geometry._getPCenter());
        //------------------------拖动标注--------------------------
        var centerHandle = this.createHandle(pxCenter, {
            tip:"拖动以移动图形",
            onDown:function() {
                if (opts.onDown) {
                    opts.onDown.call(this);
                }
                geometry['draggable']._startDrag();
            },
            onMove:function(handleDomOffset) {
                if (opts.onMove) {
                    opts.onMove.call(this);
                }
                // centerHandle.onRefresh();
                this._refreshHandlePosition(centerHandle);
                this.fireEditEvent('positionchanging');
            },
            onUp:function() {
                if (opts.onUp) {
                    opts.onUp.call(this);
                }
                this.fireEditEvent('positionchanged');
            },
            onRefresh:function() {
                return map._transformToViewPoint(geometry._getPCenter());
            }
        });

    },
    /**
     * 标注和自定义标注编辑器
     */
    createMarkerEditor:function() {
        var marker = this.geometry,
            symbol = marker.getSymbol(),
            geometryToEdit = this.geometryToEdit;
        var radiusHandle;
        var fnGetVectorSizePos;
        if (marker._canEdit()) {
            //创建编辑矢量类型marker大小的handle
            var dxdy = new Z.Point(0,0);
            if (symbol['markerDx'] && symbol['markerDy']) {
                dxdy = new Z.Point(symbol['markerDx'], symbol['markerDy']);
            }
            fnGetVectorSizePos = function() {
                var width = symbol['markerWidth'], height = symbol['markerHeight'];
                var viewCenter = marker._getCenterViewPoint();
                return viewCenter.add(new Z.Point(width/2, height/2)).add(dxdy);
            };
            radiusHandle = this.createHandle(fnGetVectorSizePos(),{
                tip:"拖动以调整矢量标注大小",
                onMove:function(handleDomOffset) {
                    var viewCenter = marker._getCenterViewPoint().add(dxdy);
                    var wh = handleDomOffset.substract(viewCenter);
                    var width = Math.abs(wh.x)*2,
                    height = Math.abs(wh.y)*2;
                    symbol['markerWidth'] = width;
                    symbol['markerHeight'] = height;
                    marker.setSymbol(symbol);
                    geometryToEdit.setSymbol(symbol);
                },
                onUp:function() {

                },
                onRefresh:function() {
                    return fnGetVectorSizePos();
                }
            });
        }
        this.createCenterEditor({
            onDown:function() {
                if (radiusHandle) {
                    radiusHandle.style.display='none';
                }
            },
            onUp:function() {
                if (radiusHandle) {
                    var pos = fnGetVectorSizePos();
                    radiusHandle.style.top=(pos.y)+"px";
                    radiusHandle.style.left=(pos.x)+"px";
                    radiusHandle.style.display="";
                }
            }
        });
    },

    /**
     * 圆形编辑器
     * @return {[type]} [description]
     */
    createCircleEditor:function() {
        var geometry = this.geometry;
        var map = this.getMap();
        function radiusHandleOffset() {
            var pxCenter = map._transformToViewPoint(geometry._getPCenter());
            var r = geometry.getRadius();
            var p = map.distanceToPixel(r,0);
            var rPx= new Z.Point(pxCenter.x+p['width'],pxCenter.y);// {'left':pxCenter.x+p['width'],'top':pxCenter.y};
            return rPx;
        }
        var rPx = radiusHandleOffset();
        var radiusHandle = this.createHandle(rPx, {
            tip:"拖动以调整圆形半径",
            onMove:function(handleDomOffset) {
                var pxCenter = map._transformToViewPoint(geometry._getPCenter());
                var rPx = handleDomOffset.x-pxCenter.x;
                var rPy = handleDomOffset.y-pxCenter.y;
                //if (rPx >= 0 && rPy >= 0) {
                var r = map.pixelToDistance(Math.abs(rPx), Math.abs(rPy));
                geometry.setRadius(r);
                //}
                this.fireEditEvent('shapechanging');
            },
            onUp:function() {
                this.fireEditEvent('shapechanged');
            },
            onRefresh:function() {
                return radiusHandleOffset();
            }
         });
         this.createCenterEditor({
            onDown:function() {
                radiusHandle.style.display='none';
            },
            onUp:function() {
                var rPx = radiusHandleOffset();
                radiusHandle.style.top=(rPx.y-5)+"px";
                radiusHandle.style.left=(rPx.x-5)+"px";
                radiusHandle.style.display="";
            }
        });
    },

    /**
     * 椭圆编辑器
     * @return {[type]} [description]
     */
    createEllipseEditor:function() {
        var geometry = this.geometry;
        var map = this.getMap();
        function radiusHandleOffset() {
            var pxCenter = map._transformToViewPoint(geometry._getPCenter());
            var rx = Math.round(geometry.getWidth()/2);
            var rh = Math.round(geometry.getHeight()/2);
            var p = map.distanceToPixel(rx,rh);
            var rPx={'left':pxCenter.x+p['width'],'top':pxCenter.y+p['height']};
            return rPx;
        }
        //this.createCenterEditor();
        var rPx = radiusHandleOffset();
        var rHandle = this.createHandle(rPx, {
            tip:"拖动以调整椭圆大小",
            onMove:function(handleDomOffset) {
                var pxCenter = map._transformToViewPoint(geometry._getPCenter());
                var rxPx = handleDomOffset.x-pxCenter.x;
                var ryPx = handleDomOffset.y-pxCenter.y;
                if (rxPx >= 0 && ryPx>=0) {
                    var w = map.pixelToDistance(Math.abs(rxPx), 0);
                    var h = map.pixelToDistance(0,Math.abs(ryPx));
                    geometry.setWidth(w*2);
                    geometry.setHeight(h*2);
                }
                this.fireEditEvent('shapechanging');
                // geometry.fire("shapechanging",{"target":geometry});
            },
            onUp:function() {
                this.fireEditEvent('shapechanged');
                // geometry.fire("shapechanged",{"target":geometry});
            },
            onRefresh:function() {
                return radiusHandleOffset();
            }
        });
        this.createCenterEditor({
            onDown:function() {
                rHandle.style.display='none';
            },
            onUp:function() {
                var rPx = radiusHandleOffset();
                rHandle.style.top=(rPx.y-5)+"px";
                rHandle.style.left=(rPx.x-5)+"px";
                rHandle.style.display="";
            }
        });
    },
    /**
     * 矩形编辑器
     * @return {[type]} [description]
     */
    createRectEditor:function() {
        var geometry = this.geometry;
        var map = this.getMap();
        function radiusHandleOffset() {
            var pxNw = map._transformToViewPoint(geometry._getPNw());
            var rw = Math.round(geometry.getWidth());
            var rh = Math.round(geometry.getHeight());
            var p = map.distanceToPixel(rw,rh);
            var rPx= new Z.Point(pxNw.x+p['width'],pxNw.y+p['height']);//{'left':pxNw.x+p['width'],'top':pxNw.y+p['height']};
            return rPx;
        }

        var rPx = radiusHandleOffset();
        var rHandle = this.createHandle(rPx, {
            tip:"拖动以调整矩形大小",
            onMove:function(handleDomOffset) {
                var pxNw = map._transformToViewPoint(geometry._getPNw());
                var rxPx = handleDomOffset.x-pxNw.x;
                var ryPx = handleDomOffset.y-pxNw.y;
                if (rxPx >= 0 && ryPx>=0) {
                    var w = map.pixelToDistance(Math.abs(rxPx), 0);
                    var h = map.pixelToDistance(0,Math.abs(ryPx));
                    geometry.setWidth(w);
                    geometry.setHeight(h);
                }
                this.fireEditEvent('shapechanging');
            },
            onUp:function() {
                this.fireEditEvent('shapechanged');
            },
            onRefresh:function() {
                return radiusHandleOffset();
            }
        });
        var pxNw = map._transformToViewPoint(geometry._getPNw());
        //------------------------拖动标注--------------------------
        var nwHandle = this.createHandle(pxNw, {
            tip:"拖动以移动图形",
            onDown:function() {
                rHandle.style.display='none';
                geometry['draggable']._startDrag();
            },
            onMove:function(handleDomOffset) {
                // nwHandle.onRefresh();
                this._refreshHandlePosition(nwHandle);
                this.fireEditEvent('positionchanging');
            },
            onUp:function() {
                var rPx = radiusHandleOffset();
                rHandle.style.top=(rPx.y-5)+"px";
                rHandle.style.left=(rPx.x-5)+"px";
                rHandle.style.display="";
                this.fireEditEvent('positionchanged');
            },
            onRefresh:function() {
                return map._transformToViewPoint(geometry._getPNw());
            }
        });
    },

    /**
     * 多边形和多折线的编辑器
     * @return {[type]} [description]
     */
    createPolygonEditor:function() {
        var geometry = this.geometry;
        var map = this.getMap();
        var vertexHandles = [];
        var closeHandle = null;
        var centerHandle = null;
        var tmpHandle = null;
        var title = ((geometry instanceof Z.Polygon)?'多边形':'多折线');
        function getLonlats() {
            if (geometry instanceof Z.Polygon) {
                return geometry._getPrjPoints();
            } else if (geometry instanceof Z.Polyline) {
                return geometry._getPrjPoints();
            }
        }
        function createVertexHandle(index) {
            var vertex = getLonlats()[index];
            var pxVertex = map._transformToViewPoint(vertex);
            //------------------------拖动标注--------------------------
            var handle = this.createHandle(pxVertex, {
                tip:"拖动以调整"+title+"顶点",
                onMove:function(handleDomOffset) {
                    hideCloseHandle();
                    var nVertex = map._untransformFromViewPoint(handleDomOffset);
                    var vertex = getLonlats()[handle['maptalks--editor-vertex-index']];
                    vertex.x = nVertex.x;
                    vertex.y = nVertex.y;
                    geometry._updateCache();
                    geometry._onShapeChanged();
                    this.fireEditEvent('shapechanging');
                },
                onUp:function() {
                    this.fireEditEvent('shapechanged');
                    this.refreshHandles([centerHandle]);
                },
                onRefresh:function() {
                    var vertex = getLonlats()[handle['maptalks--editor-vertex-index']];
                    return map._transformToViewPoint(vertex);
                }
            });
            handle['maptalks--editor-vertex-index'] = index;
            Z.DomUtil.addDomEvent(handle,'mouseover',function(event){
                //当只存在三个端点, 再删除会变成无效的多边形,不再出现删除端点按钮
                if (vertexHandles.length <= 3) {
                    return;
                }
                closeHandle.style.top = (parseInt(handle.style.top)-2)+"px";
                closeHandle.style.left = (parseInt(handle.style.left)+12)+"px";
                closeHandle.style.display="block";
                closeHandle["source"] = handle;
            },this);
            return handle;
        }
        function hideCloseHandle() {
            closeHandle.style.display="none";
        }
        function createRemoveHandle() {
            closeHandle = Z.DomUtil.createEl("div");
            closeHandle.style.cssText="display:none;position: absolute; cursor: pointer;top:-9999px;left:0px;";
            closeHandle.innerHTML='<div title="点击删除端点" style="display:block;width:14px;height:14px;background:url(' + Z.prefix + 'images/close.gif) 0px 0px no-repeat;"></div>';
            Z.DomUtil.addDomEvent(closeHandle,'click',function(ev) {
                if (vertexHandles.length <= 3) {
                    return;
                }
                var ringhandle = closeHandle["source"];
                hideCloseHandle();
                if (!ringhandle) {
                    Z.DomUtil.stopPropagation(ev);
                    return false;
                }
                var hit = Z.Util.searchInArray(ringhandle, vertexHandles);
                /*var hit = -1;
                for (var i=0,len=vertexHandles.length;i<len;i++) {
                    if (vertexHandles[i] == ringhandle) {
                        hit = i;
                        break;
                    }
                }*/
                if (hit < 0) {
                    Z.DomUtil.stopPropagation(ev);
                    return false;
                }
                var lonlats = getLonlats();
                lonlats.splice(hit,1);
                vertexHandles.splice(hit,1);

                //刷新handler上的多边形顶点序号
                for (var i = 0; i < vertexHandles.length; i++) {
                    vertexHandles[i]['maptalks--editor-vertex-index'] = i;
                }

                Z.DomUtil.removeDomNode(ringhandle);
                geometry._updateCache();
                geometry._onShapeChanged();
                if (centerHandle) {
                    this.refreshHandles([centerHandle]);
                }
                this.fireEditEvent('shapechanged');
                // geometry.fire("shangechanged",{"target":geometry});
                Z.DomUtil.stopPropagation(ev);
                return false;
            },this);
            Z.DomUtil.addDomEvent(closeHandle,'mouseout',function(ev) {
                hideCloseHandle();
                closeHandle["source"] = null;
                Z.DomUtil.stopPropagation(ev);
                return false;
            },this);
            this.appendHandler(closeHandle,{onRefresh:function(){hideCloseHandle();}});
        }
        function computePxCenter() {
            var center = geometry.getCenter();
            var pcenter = map._getProjection().project(center);
            return map._transformToViewPoint(pcenter);
        }
        function createCenterHandle() {
            centerHandle = this.createHandle(computePxCenter(), {
                tip:"拖动以移动"+title,
                onDown:function() {
                    hideCloseHandle();
                    for (var i=0,len=vertexHandles.length;i<len;i++) {
                        vertexHandles[i].style.display = "none";
                    }
                    geometry['draggable']._startDrag();
                },
                onMove:function(handleDomOffset) {
                    this.fireEditEvent('positionchanging');
                },
                onUp:function() {
                    this.refreshHandles(vertexHandles);
                    for (var i=0,len=vertexHandles.length;i<len;i++) {
                        vertexHandles[i].style.display = "";
                    }
                    this.fireEditEvent('positionchanged');
                },
                onRefresh:function() {
                    return computePxCenter();
                }
            });
        }
        function isPointOverlapped(p1,p2,tolerance) {
            if (!p1 || !p2) {
                return false;
            }
            var t = (tolerance?Math.abs(tolerance):0);
            if (Math.abs(p1.x-p2.x) <= t && Math.abs(p1.y-p2.y) <= t) {
                return true;
            }
            return false;
        }
        var lonlats = getLonlats();
        for (var i=0,len=lonlats.length;i<len;i++){
            vertexHandles.push(createVertexHandle.call(this,i));
        }
        createCenterHandle.call(this);
        createRemoveHandle.call(this);
        tmpHandle = this.createHandleDom(new Z.Point(0,0),{
                            tip:'点击后增加节点',
                            cursor:'pointer'
                        });
        tmpHandle.style.display='none';
        var pxTolerance = 2;
        Z.DomUtil.addDomEvent(tmpHandle,'click',function(event) {
            var lonlats = getLonlats();
            //临时编辑按钮的点击
            var handleDomOffset = Z.DomUtil.offsetDom(tmpHandle);
            var res = map._getTileConfig()['resolutions'][map.getZoom()];
            var plonlat = map._untransformFromViewPoint(new Z.Point(handleDomOffset.x+5,handleDomOffset.y+5));
            var interIndex = Z.GeoUtils._isPointOnPath(plonlat, geometry, pxTolerance*res);
            if (interIndex >= 0) {
                lonlats.splice(interIndex+1,0,plonlat);
                vertexHandles.splice(interIndex+1,0,createVertexHandle.call(this,interIndex+1));
                geometry._setPrjPoints(lonlats);
                geometry._updateCache();
                this.fireEditEvent('shapechanged');
            }
        },this);

        Z.DomUtil.addDomEvent(map._containerDOM,'mousemove',function(event) {
            var res = map._getTileConfig()['resolutions'][map.getZoom()];
            var eventOffset = Z.DomUtil.getEventContainerPoint(event,map._containerDOM);
            var plonlat = map._untransform(eventOffset);
            var tolerance = pxTolerance*res;
            var interIndex = Z.GeoUtils._isPointOnPath(plonlat, geometry,tolerance);
            var prjPoints = getLonlats();
            //不与端点重叠,如果重叠则不显示
            if (interIndex >= 0 && !isPointOverlapped(plonlat,prjPoints[interIndex],tolerance) && !isPointOverlapped(plonlat,prjPoints[interIndex+1],tolerance)) {
                var viewPoint = map._containerPointToViewPoint(eventOffset);
                tmpHandle.style.left = (viewPoint.x-5)+'px';
                tmpHandle.style.top = (viewPoint.y-5)+'px';
                tmpHandle.style.display="";
            } else {
                tmpHandle.style.display="none";
            }
        }, this);
        this.appendHandler(tmpHandle,{onRefresh:function(){tmpHandle.style.display='none';return null;}});

    },

    /**
     * refresh开始前逻辑
     */
    onRefreshStart:function() {
        this._container.style.display="none";
    },

    /**
     * refesh及refresh之后的逻辑
     */
    onRefreshEnd:function() {
        this.refresh();
        this._container.style.display="";
    },

    refresh:function() {
        //TODO 更新手点的位置
        if (!this.editHandlers) {
            return;
        }
        this.refreshHandles(this.editHandlers);
    },

    refreshHandles:function(handles) {
        if (!handles) {
            return;
        }
        for (var i=0,len=handles.length;i<len;i++) {
            if (handles[i] && handles[i].onRefresh) {
                this._refreshHandlePosition(handles[i]);
            }
        }
    },

    _refreshHandlePosition:function(handle) {
        var offset = handle.onRefresh();
        if (offset) {
            handle.style.left = (offset.x-5)+'px';
            handle.style.top = (offset.y-5)+'px';
        }
    },

    hideContext:function() {
        if (this.geometry) {
            this.geometry.closeMenu();
            this.geometry.closeInfoWindow();
        }
    },

    appendHandler:function(handle,opts){
        if (!handle) {
            return;
        }
        if (!this.editHandlers) {
            this.editHandlers = [];
        }
        handle.onRefresh = opts.onRefresh;
        this.editHandlers.push(handle);
        this._container.appendChild(handle);
    },

    removeHandler:function(handle) {
        if (this.editHandlers) {
            var hit = -1;
            for (var i=0,len=this.editHandlers.length;i<len;i++){
                if (this.editHandlers[i] == handle) {
                    hit = i;
                    break;
                }
            }
            if (hit > 0) {
                this.editHandlers.splice(hit,1);
            }
        }
        if (handle) {
            Z.DomUtil.removeDomNode(handle);
        }
    }

});
