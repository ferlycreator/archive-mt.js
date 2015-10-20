Z.render.vectorlayer.Dom = function(layer) {
    this._layer = layer;
    this._registerEvents();
};

Z.render.vectorlayer.Dom.prototype= {
    //瓦片图层的基础ZIndex
    baseZIndex:200,

    _registerEvents:function() {
        this.getMap().on('_zoomend',function(){
            this._layer._eachGeometry(function(geo) {
                geo._onZoomEnd();
            });
        },this);
    },

    getMap:function() {
        return this._layer.getMap();
    },

    /**
     * 显示图层
     * @expose
     */
    show:function() {
        this._layer._eachGeometry(function(geo) {
            geo.show();
        });
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        this._layer._eachGeometry(function(geo) {
            geo.hide();
        });
    },

    /**
     * 绘制Geometry
     * @param  {[type]} geometries [description]
     * @return {[type]}            [description]
     */
    rend:function(geometries) {
        if (!this._layerContainer) {
            this._layerContainer = this.getMap()._getRender().getLayerRenderContainer(this._layer);
        }
        if (!geometries) {
            this._rendAll();
            return;
        }
        var vectorPaper = this.getMap()._getRender().getSvgPaper();
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



    _rendAll:function() {
        var layerContainer = this._layerContainer;
        var zIndex = this._zIndex;
        var vectorPaper = this.getMap()._getRender().getSvgPaper();
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
        this._zIndex=zIndex+this.baseZIndex;
        this._layer._eachGeometry(function(geo) {
            if (geo._getPainter()) {
                geo._getPainter().setZIndex(zIndex);
            }
        });
    }
};
