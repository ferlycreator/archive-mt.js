Z.Render.Dom = {


    /**
     * 显示图层
     * @expose
     */
    show:function() {
        if (this._visible) {
            return;
        }
        this._eachGeometry(function(geo) {
            geo.show();
        });
        this._visible=true;
        return this;
    },

    /**
     * 隐藏图层
     * @expose
     */
    hide:function() {
        if (!this._visible) {
            return;
        }
        this._eachGeometry(function(geo) {
            geo.hide();
        });
        this._visible=false;
        return this;
    },

    /**
     * 图层是否显示
     * @return {Boolean} 图层是否显示
     * @expose
     */
    isVisible:function() {
        return this._visible && this.layerDom && this.layerDom.style.display !== 'none';
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



    addTo:function() {
        this._eachGeometry(function(geo) {
            if (geo._getPainter()) {
                geo._getPainter().paint(this.layerDom,  this.zIndex);
            }
        });
    },


    load:function() {
        var map = this.getMap();
        this.layerDom = map._panels.svgContainer;
        map._createSVGPaper();
        this.addTo();
    },

    _setZIndex:function(zIndex) {
        this.zIndex=zIndex;
        this._eachGeometry(function(geo) {
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
        this._eachGeometry(function(geo) {
            geo._onZoomEnd();
        });
        //this.show();
    },

    _onResize:function() {
        //nothing to do
    }


};