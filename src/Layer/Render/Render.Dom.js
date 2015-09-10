Z.Render.Dom = function(layer,options) {
    this.layer = layer;
    this._visible=options['visible'];
};

Z.Render.Dom.prototype= {
    getMap:function() {
        return this.layer.getMap();
    },

    load:function() {
        var map = this.getMap();
        this.layerDom = map._panels.svgContainer;
        // map._createSVGPaper();
        this._addTo();
    },

    /**
     * 显示图层
     * @expose
     */
    show:function() {
        if (this._visible) {
            return;
        }
        this.layer._eachGeometry(function(geo) {
            geo.show();
        });
        this._visible=true;
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        if (!this._visible) {
            return;
        }
        this.layer._eachGeometry(function(geo) {
            geo.hide();
        });
        this._visible=false;
    },

    /**
     * 图层是否显示
     * @return {Boolean} 图层是否显示
     * @expose
     */
    isVisible:function() {
        return this._visible/* && this.layerDom && this.layerDom.style.display !== 'none'*/;
    },

    /**
     * 绘制Geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    _paintGeometries:function(geometries) {
        for (var i=0,len=geometries.length;i<len;i++) {
            var geo = geometries[i];
            if (!geo) {
                continue;
            }
            if (geo._getPainter()) {
                geo._getPainter().paint(this.layerDom,  this.zIndex);
            }
        }
    },



    _addTo:function() {
        this.layer._eachGeometry(function(geo) {
            if (geo._getPainter()) {
                geo._getPainter().paint(this.layerDom,  this.zIndex);
            }
        });
    },




    _setZIndex:function(zIndex) {
        this.zIndex=zIndex;
        this.layer._eachGeometry(function(geo) {
            if (geo._getPainter()) {
                geo._getPainter()._setZIndex(zIndex);
            }
        });
    },

    _onMoveStart:function() {
        //nothing to do
    },

    /**
     * 地图中心点变化时的响应函数
     */
    _onMoving:function() {
        //nothing to do
    },

    _onMoveEnd:function() {
        //nothing to do
    },

    /**
     * 地图放大缩小时的响应函数
     * @return {[type]} [description]
     */
    _onZoomStart:function() {
        //this.hide();
    },

    _onZoomEnd:function() {
        this.layer._eachGeometry(function(geo) {
            geo._onZoomEnd();
        });
    },

    _onResize:function() {
        //nothing to do
    }
};
