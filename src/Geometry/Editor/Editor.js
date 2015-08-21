Z.Editor=Z.Class.extend({
    includes: [Z.Eventable],

    initialize:function(geometry,opts) {
        this.geometry = geometry;
        if (!this.geometry) {return;}
        //Z.Util.extend(this, opts);
        this.opts = opts;
        if (!this.opts) {
            this.opts = {};
        }
    },

    prepare:function() {
        var map=this.geometry.getMap();
        if (!map) {return;}
        this.map=map;
        this.geoType = this.geometry.getType();
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
            this.originalSymbol=this.geometry.getSymbol();
            this.geometry.setSymbol(this.opts['symbol']);
        }

        this.editHandlers = [];

        map.bind("zoomend",this.onRefreshEnd,this);
        map.bind("zoomstart",this.onRefreshStart,this);
        map.bind('moveend',this.onRefreshEnd,this);
        map.bind("resize",this.onRefreshEnd,this);
    },

    /**
     * 开始编辑
     */
    start:function() {
        if (!this.geometry || !this.geometry.getMap() || this.geometry.editing) {return;}
        this.prepare();
        var geometry = this.geometry;
        if (geometry instanceof Z.Marker) {
            this.createMarkerEditor();
            return;
        } else if (geometry instanceof Z.Circle) {
            this.createCircleEditor();
        } else if (geometry instanceof Z.Rectangle) {
            this.createRectEditor();
        } else if (geometry instanceof Z.Ellipse) {
            this.createEllipseEditor();
        } else if (geometry instanceof Z.Polygon || geometry instanceof Z.Polyline){
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
        var map = this.map;
        if (!map || !this.geometry) {
            return;
        }
        map.off('zoomend', this.onRefreshEnd,this);
        map.off('zoomstart', this.onRefreshStart,this);
        map.off('resize', this.onRefreshEnd,this);
        for (var i=0,len=this.editHandlers.length;i<len;i++) {
            Z.DomUtil.removeDomNode(this.editHandlers[i]);
        }
        this.editHandlers=[];

        if (this.opts['symbol']) {
            this.geometry.setSymbol(this.originalSymbol);
            delete this.originalSymbol;
        }
    },

    isEditing:function() {
        if (Z.Util.isNil(this.editing)) {
            return false;
        }
        return this.editing;
    },

    fireEditEvent:function(eventName) {
        if (!this.geometry) {
            return;
        }
        this.geometry.fire(eventName,{"target":this.geometry});
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
            (pixel.top-5)+"px;left:"+(pixel.left-5)+"px;cursor:"+cursorStyle+";";
        handle.innerHTML='<div title="'+opts.tip+'" style="display:block;width:11px;height:11px;background:url('+Z.host+'/engine/images/dd-via.png) 0px 0px no-repeat;"></div>';
        return handle;
    },

    createHandle:function(pixel, opts) {
        if (!opts) {
            opts = {tip:''};
        }
        var handle = this.createHandleDom(pixel,opts);
        var _containerDOM = this.map._containerDOM;
        Z.DomUtil.addDomEvent(handle,'mousedown',function(event) {
                            var editor = this;
                            if (opts.onDown) {
                                opts.onDown.call(editor);
                            }
                            //鼠标拖动操作
                            document.onmouseup = function(ev) {
                                ev  = ev || window.event;
                                document.onmousemove=null;
                                document.onmouseup=null;
                                Z.DomUtil.stopPropagation(ev);
                                if (opts.onUp) {
                                    opts.onUp.call(editor);
                                }
                                return false;
                            };
                            document.onmousemove = function(ev){
                                ev  = ev || window.event;
                                editor.hideContext();
                                var mousePos = Z.DomUtil.getEventDomCoordinate(ev,_containerDOM);
                                var handleDomOffset = editor.map._screenToDomOffset(mousePos);
                                handle.style['top']=(handleDomOffset.top-5)+"px";
                                handle.style['left']=(handleDomOffset.left-5)+"px";
                                Z.DomUtil.stopPropagation(ev);
                                if (opts.onMove) {
                                    opts.onMove.call(editor,handleDomOffset);
                                }
                                return false;
                            };
                            Z.DomUtil.stopPropagation(event);

                            return false;
                        },this);
        //拖动移图
        this.appendHandler(handle,opts);

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
        var map = this.map;
        var pxCenter = map._untransformToOffset(geometry.getPCenter());
        //------------------------拖动标注--------------------------
        this.createHandle(pxCenter, {
                        tip:"拖动以移动图形",
                        onDown:function() {
                            if (opts.onDown) {
                                opts.onDown.call(this);
                            }
                        },
                        onMove:function(handleDomOffset) {
                            var pcenter = map._transformFromOffset(handleDomOffset);
                            geometry.setPCenter(pcenter);
                            geometry.updateCache();
                            if (opts.onMove) {
                                opts.onMove.call(this);
                            }
                            this.fireEditEvent('positionchanging');
                        },
                        onUp:function() {
                            if (opts.onUp) {
                                opts.onUp.call(this);
                            }
                            // geometry.fire("positionchanged",{"target":geometry});
                            this.fireEditEvent('positionchanged');
                        },
                        onRefresh:function() {
                            return map._untransformToOffset(geometry.getPCenter());
                        }
                    });

    },
    /**
     * 标注和自定义标注编辑器
     */
    createMarkerEditor:function() {
        this.createCenterEditor();
    },

    /**
     * 圆形编辑器
     * @return {[type]} [description]
     */
    createCircleEditor:function() {
        var geometry = this.geometry;
        var map = this.map;
        function radiusHandleOffset() {
            var pxCenter = map._untransformToOffset(geometry.getPCenter());
            var r = geometry.getRadius();
            var p = map.distanceToPixel(r,0);
            var rPx={'left':pxCenter['left']+p['px'],'top':pxCenter['top']};
            return rPx;
        }
        var rPx = radiusHandleOffset();
        var radiusHandle = this.createHandle(rPx, {
                                tip:"拖动以调整圆形半径",
                                onMove:function(handleDomOffset) {
                                    var pxCenter = map._untransformToOffset(geometry.getPCenter());
                                    var rPx = handleDomOffset['left']-pxCenter['left'];
                                    var rPy = handleDomOffset['top']-pxCenter['top'];
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
                radiusHandle.style.top=(rPx['top']-5)+"px";
                radiusHandle.style.left=(rPx['left']-5)+"px";
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
        var map = this.map;
        function radiusHandleOffset() {
            var pxCenter = map._untransformToOffset(geometry.getPCenter());
            var rx = Math.round(geometry.getWidth()/2);
            var rh = Math.round(geometry.getHeight()/2);
            var p = map.distanceToPixel(rx,rh);
            var rPx={'left':pxCenter['left']+p['px'],'top':pxCenter['top']+p['py']};
            return rPx;
        }
        //this.createCenterEditor();
        var rPx = radiusHandleOffset();
        var rHandle = this.createHandle(rPx, {
                                tip:"拖动以调整椭圆大小",
                                onMove:function(handleDomOffset) {
                                    var pxCenter = map._untransformToOffset(geometry.getPCenter());
                                    var rxPx = handleDomOffset.left-pxCenter.left;
                                    var ryPx = handleDomOffset.top-pxCenter.top;
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
                rHandle.style.top=(rPx['top']-5)+"px";
                rHandle.style.left=(rPx['left']-5)+"px";
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
        var map = this.map;
        function radiusHandleOffset() {
            var pxNw = map._untransformToOffset(geometry.getPNw());
            var rw = Math.round(geometry.getWidth());
            var rh = Math.round(geometry.getHeight());
            var p = map.distanceToPixel(rw,rh);
            var rPx={'left':pxNw['left']+p['px'],'top':pxNw['top']+p['py']};
            return rPx;
        }

        var rPx = radiusHandleOffset();
        var rHandle = this.createHandle(rPx, {
                                tip:"拖动以调整矩形大小",
                                onMove:function(handleDomOffset) {
                                    var pxNw = map._untransformToOffset(geometry.getPNw());
                                    var rxPx = handleDomOffset['left']-pxNw['left'];
                                    var ryPx = handleDomOffset['top']-pxNw['top'];
                                    if (rxPx >= 0 && ryPx>=0) {
                                        var w = map.pixelToDistance(Math.abs(rxPx), 0);
                                        var h = map.pixelToDistance(0,Math.abs(ryPx));
                                        geometry.setWidth(w);
                                        geometry.setHeight(h);
                                    }
                                    this.fireEditEvent('shapechanging');
                                    //geometry.fire("shapechanging",{"target":geometry});
                                },
                                onUp:function() {
                                    this.fireEditEvent('shapechanged');
                                    // geometry.fire("shapechanged",{"target":geometry});
                                    //geometry.fire("shapechanged",{"target":geometry});
                                },
                                onRefresh:function() {
                                    return radiusHandleOffset();
                                }
                            });
        var pxNw = map._untransformToOffset(geometry.getPNw());
        //------------------------拖动标注--------------------------
        this.createHandle(pxNw, {
            tip:"拖动以移动图形",
            onDown:function() {
                rHandle.style.display='none';
            },
            onMove:function(handleDomOffset) {
                var pnw = map._transformFromOffset(handleDomOffset);
                geometry.setPNw(pnw);
                geometry.updateCache();
                this.fireEditEvent('positionchanging');
                // geometry.fire("positionchanging",{"target":geometry});
            },
            onUp:function() {
                var rPx = radiusHandleOffset();
                rHandle.style.top=(rPx['top']-5)+"px";
                rHandle.style.left=(rPx['left']-5)+"px";
                rHandle.style.display="";
                this.fireEditEvent('positionchanged');
                // geometry.fire("positionchanged",{"target":geometry});
            },
            onRefresh:function() {
                return map._untransformToOffset(geometry.getPNw());
            }
        });
    },

    /**
     * 多边形和多折线的编辑器
     * @return {[type]} [description]
     */
    createPolygonEditor:function() {
        var geometry = this.geometry;
        var map = geometry.getMap();
        var vertexHandles = [];
        var closeHandle = null;
        var centerHandle = null;
        var tmpHandle = null;
        var title = ((geometry instanceof Z.Polygon)?'多边形':'多折线');
        function getLonlats() {
            if (geometry instanceof Z.Polygon) {
                return geometry.getPrjShell();
            } else if (geometry instanceof Z.Polyline) {
                return geometry.getPrjPath();
            }
        }
        function createVertexHandle(vertex) {
            //vertex是个引用
            var pxVertex = map._untransformToOffset(vertex);
            //------------------------拖动标注--------------------------
            var handle = this.createHandle(pxVertex, {
                            tip:"拖动以调整"+title+"顶点",
                            onMove:function(handleDomOffset) {
                                hideCloseHandle();
                                var nVertex = map._transformFromOffset(handleDomOffset);
                                vertex.x = nVertex.x;
                                vertex.y = nVertex.y;
                                geometry.updateCache();
                                geometry.onShapeChanged();
                                this.fireEditEvent('shapechanging');
                                // geometry.fire("shapechanging",{"target":geometry});
                                // geometry.fire("shapechanging",{"target":geometry});
                            },
                            onUp:function() {
                                this.fireEditEvent('shapechanged');
                                this.refreshHandles([centerHandle]);
                                // geometry.fire("shapechanged",{"target":geometry});
                                // geometry.fire("shapechanged",{"targetmouseover":geometry});
                            },
                            onRefresh:function() {
                                return map._untransformToOffset(vertex);
                            }
                        });
            Z.DomUtil.addDomEvent(handle,'mouseover',function(event){
                                        closeHandle.style.top = (parseInt(handle.style.top)-2)+"px";
                                        closeHandle.style.left = (parseInt(handle.style.left)+12)+"px";
                                        closeHandle.style.display="block";
                                        closeHandle["source"] = handle;
                                    },this);
            return handle;
        }
        function hideCloseHandle() {
            closeHandle.style.display="none";
            //closeHandle.style.top="-999999px";
            //closeHandle["source"] = null;
            //closeHandle.style.top="-999999px";
        }
        function createRemoveHandle() {
            closeHandle = Z.DomUtil.createEl("div");
            closeHandle.style.cssText="display:none;position: absolute; cursor: pointer;top:-9999px;left:0px;";
            closeHandle.innerHTML="<div title=\"点击删除端点\" style=\"display:block;width:14px;height:14px;background:url("+Z.host+"/engine/images/close.gif) 0px 0px no-repeat;\"></div>";
            Z.DomUtil.addDomEvent(closeHandle,'click',function(ev) {
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

                Z.DomUtil.removeDomNode(ringhandle);
                geometry.updateCache();
                geometry.onShapeChanged();
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
            return map._untransformToOffset(pcenter);
        }
        function createCenterHandle() {
            centerHandle = this.createHandle(computePxCenter(), {
                            tip:"拖动以移动"+title,
                            onDown:function() {
                                hideCloseHandle();
                                for (var i=0,len=vertexHandles.length;i<len;i++) {
                                    vertexHandles[i].style.display = "none";
                                }
                            },
                            onMove:function(handleDomOffset) {
                                var pxCenter = computePxCenter();
                                var dragged = {
                                    'left': handleDomOffset['left']+5-pxCenter['left'],
                                    'top' : handleDomOffset['top']+5-pxCenter['top']
                                };
                                //TODO 移动vertex,重新赋值points
                                var lonlats = getLonlats();
                                for (var i=0,len=lonlats.length;i<len;i++) {
                                    var vo = map._untransformToOffset(lonlats[i]);
                                    var n = map._transformFromOffset({'left':vo['left']+dragged['left'], 'top':vo['top']+dragged['top']});
                                    lonlats[i].x = n.x;
                                    lonlats[i].y = n.y;
                                }
                                geometry.updateCache();
                                geometry.onPositionChanged();
                                this.fireEditEvent('positionchanging');
                                // geometry.fire("positionchanging",{"target":geometry});
                            },
                            onUp:function() {
                                this.refreshHandles(vertexHandles);
                                for (var i=0,len=vertexHandles.length;i<len;i++) {
                                    vertexHandles[i].style.display = "";
                                }
                                this.fireEditEvent('positionchanged');
                                // geometry.fire("positionchanged",{"target":geometry});
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
            vertexHandles.push(createVertexHandle.call(this,lonlats[i]));
        }
        createCenterHandle.call(this);
        createRemoveHandle.call(this);
        tmpHandle = this.createHandleDom({'left':0,'top':0},{
                            tip:'点击后增加节点',
                            cursor:'pointer'
                        });
        tmpHandle.style.display='none';
        var pxTolerance = 2;
        Z.DomUtil.addDomEvent(tmpHandle,'click',function(event) {
                            //临时编辑按钮的点击
                            var handleDomOffset = Z.DomUtil.offsetDom(tmpHandle);
                            var res = map._getLodConfig()['resolutions'][map.getZoomLevel()];
                            var plonlat = map._transformFromOffset({'left':handleDomOffset['left']+5,'top':handleDomOffset['top']+5});
                            var interIndex = Z.GeoUtils._isPointOnPath(plonlat, geometry, pxTolerance*res);
                            if (interIndex >= 0) {
                                vertexHandles.splice(interIndex+1,0,createVertexHandle.call(this,plonlat));
                                lonlats.splice(interIndex+1,0,plonlat);
                                geometry.setPrjPoints(lonlats);
                                geometry.updateCache();
                                this.fireEditEvent('shapechanged');
                            }
                        },this);

        Z.DomUtil.addDomEvent(map._containerDOM,'mousemove',function(event) {
                        var res = map._getLodConfig()['resolutions'][map.getZoomLevel()];
                        var eventOffset = Z.DomUtil.getEventDomCoordinate(event,map._containerDOM);
                        var plonlat = map._transform(eventOffset);
                        var tolerance = pxTolerance*res;
                        var interIndex = Z.GeoUtils._isPointOnPath(plonlat, geometry,tolerance);
                        var prjPoints = getLonlats();
                        //不与端点重叠,如果重叠则不显示
                        if (interIndex >= 0 && !isPointOverlapped(plonlat,prjPoints[interIndex],tolerance) && !isPointOverlapped(plonlat,prjPoints[interIndex+1],tolerance)) {
                            var domOffset = map._screenToDomOffset(eventOffset);
                            tmpHandle.style.left = (domOffset['left']-5)+'px';
                            tmpHandle.style.top = (domOffset['top']-5)+'px';
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
                var offset = handles[i].onRefresh();
                if (offset) {
                    handles[i].style.left = (offset['left']-5)+'px';
                    handles[i].style.top = (offset['top']-5)+'px';
                }
            }
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