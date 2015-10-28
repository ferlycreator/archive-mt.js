Z.render.vectorlayer.Dom = function(layer) {
    this._layer = layer;
    this._registerEvents();
    this._layerContainer = this.getMap()._getRender().getLayerRenderContainer(this._layer);
    this._vectorPaper = this.getMap()._getRender().getSvgPaper();
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
        if (!geometries) {
            this._rendAll();
            return;
        }

        this._contexts = [document.createDocumentFragment(), document.createDocumentFragment()];
        for (var i=0,len=geometries.length;i<len;i++) {
            var geo = geometries[i];
            if (!geo || !geo.isVisible()) {
                continue;
            }
            if (geo._getPainter()) {
                geo._getPainter().paint();
            }
        }
        this._layerContainer.appendChild(this._contexts[0]);
        this._vectorPaper.appendChild(this._contexts[1]);
        delete this._contexts;
    },



    _rendAll:function() {
        this._contexts = [document.createDocumentFragment(), document.createDocumentFragment()];
        this._layer._eachGeometry(function(geo) {
            if (geo._getPainter() && geo.isVisible()) {
                geo._getPainter().paint();
            }
        });
        this._layerContainer.appendChild(this._contexts[0]);
        this._vectorPaper.appendChild(this._contexts[1]);
        delete this._contexts;
    },

    getPaintContext:function() {

        if (this._contexts) {
            return this._contexts.concat([this._zIndex]);
        } else {
            return [this._layerContainer,this._vectorPaper, this._zIndex];
        }
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
