Z.Render.Dom = function(layer,options) {
    this._layer = layer;
    this._visible=options['visible'];
    this._zIndex = options['zIndex'];
};

Z.Render.Dom.prototype= {
    getMap:function() {
        return this._layer.getMap();
    },

    load:function() {
        var map = this.getMap();
        this._layerContainer = map._panels.svgContainer;
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
        this._layer._eachGeometry(function(geo) {
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
        this._layer._eachGeometry(function(geo) {
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
        return this._visible/* && this._layerContainer && this._layerContainer.style.display !== 'none'*/;
    },

    /**
     * 绘制Geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    _paintGeometries:function(geometries) {
        var vectorPaper = this.getMap()._getSvgPaper();
        var fragment = document.createDocumentFragment();
        var vectorFragment = document.createDocumentFragment();
        for (var i=0,len=geometries.length;i<len;i++) {
            var geo = geometries[i];
            if (!geo) {
                continue;
            }
            if (geo._getPainter()) {
                geo._getPainter().paint(fragment, vectorFragment, this._zIndex, this._layerContainer, vectorPaper);
            }
        }
        this._layerContainer.appendChild(fragment);
        vectorPaper.appendChild(vectorFragment);
    },



    _addTo:function() {
        var layerContainer = this._layerContainer;
        var zIndex = this._zIndex;
        var vectorPaper = this.getMap()._getSvgPaper();
        var fragment = document.createDocumentFragment();
        var vectorFragment = document.createDocumentFragment();
        this._layer._eachGeometry(function(geo) {
            if (geo._getPainter()) {
                geo._getPainter().paint(fragment, vectorFragment,  zIndex, layerContainer, vectorPaper);
            }
        });
        this._layerContainer.appendChild(fragment);
        vectorPaper.appendChild(vectorFragment);
    },




    setZIndex:function(zIndex) {
        this._zIndex=zIndex;
        this._layer._eachGeometry(function(geo) {
            if (geo._getPainter()) {
                geo._getPainter().setZIndex(zIndex);
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
        this._layer._eachGeometry(function(geo) {
            geo._onZoomEnd();
        });
    },

    _onResize:function() {
        //nothing to do
    }
};
