Z.render.map.Dom = Z.render.map.Render.extend({
    initialize:function(map) {
        this.map = map;
        this._panels = map._panels;
        this._registerEvents();
    },

    /**
     * 获取图层渲染容器
     * @param  {Layer} layer 图层
     * @return {Dom}       容器Dom对象
     */
    getLayerRenderContainer:function(layer) {
        if (layer instanceof Z.TileLayer) {
            return this._panels.tileContainer;
        } else if (layer instanceof Z.VectorLayer) {
            return this._panels.svgContainer;
        }
    },

    /**
     * [createVectorPaper description]
     * @return {[type]} [description]
     */
    getSvgPaper: function(){
        if (!this._vectorPaper) {
            var svgContainer = this._panels.svgContainer;
            this._vectorPaper = Z.SVG.createContainer();
            this._refreshSVGPaper();
            svgContainer.appendChild(this._vectorPaper);
        }
        return this._vectorPaper;
    },

    updateMapSize:function(mSize) {
        if (!mSize) {return;}
        var width = mSize['width'],
            height = mSize['height'];
        var panels = this.map._panels;
        panels.mapWrapper.style.width = width + 'px';
        panels.mapWrapper.style.height = height + 'px';
        panels.mapViewPort.style.width = width + 'px';
        panels.mapViewPort.style.height = height + 'px';
        panels.controlWrapper.style.width = width + 'px';
        panels.controlWrapper.style.height = height + 'px';
    },

     _registerEvents:function() {
        var map = this.map;
        map.on('_movestart _baselayerchangestart _baselayerchangeend _baselayerload',function() {
           delete this._canvasBackgroundImage;
           this.render();
        },this);
        map.on('_moveend _resize',function() {
            this._refreshSVGPaper();
        },this);
        map.on('_moving', function() {
            this.render();
        },this);
        map.on('_zoomstart',function() {
            delete this._canvasBackgroundImage;
            this._clearCanvas();
        },this);
        map.on('_zoomend',function() {
            // this.render();
            this._refreshSVGPaper();
        },this);
        if (typeof window !== 'undefined' ) {
            Z.DomUtil.on(window, 'resize', this._onResize, this);
        }
        if (!Z.Browser.mobile && Z.Browser.canvas) {
             this._onMapMouseMove=function(param) {
                var vp = map._containerPointToViewPoint(param['containerPoint']);
                var layers = map.getLayers();
                var hit = false,
                    cursor;
                for (var i = layers.length - 1; i >= 0; i--) {
                    var layer = layers[i];
                    if (layer instanceof Z.VectorLayer && layer.isCanvasRender()) {
                        if (layer.options['cursor'] !== 'default' && layer._getRender().hitDetect(vp)) {
                            cursor = layer.options['cursor'];
                            hit = true;
                            break;
                        }
                    }
                }
                if (hit) {
                    map._trySetCursor(cursor);
                } else {
                    map._trySetCursor('default');
                }
            };
            map.on('_mousemove',this._onMapMouseMove,this);
        }

    },

    _showOverlayLayers:function() {
        this._panels.svgContainer.style.display="";
    },

    _hideOverlayLayers:function() {
        this._panels.svgContainer.style.display="none";
    },

    _refreshSVGPaper: function() {
        if (!this._vectorPaper) {
            return;
        }
        Z.SVG.refreshContainer(this.map,this._vectorPaper);
    },
});
