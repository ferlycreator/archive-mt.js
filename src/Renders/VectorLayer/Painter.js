Z.Painter = Z.Class.extend({
    //注册的symbolizer
    registerSymbolizers : [
        Z.StrokeAndFillSymbolizer,
        Z.ImageMarkerSymbolizer,
        Z.VectorMarkerSymbolizer,
        Z.ShieldMarkerSymbolizer,
        Z.TextMarkerSymbolizer

    ],

    initialize:function(geometry) {
        this.geometry = geometry;
        this.symbolizers = this._createSymbolizers();
    },

    /**
     * 构造symbolizers
     * @return {[type]} [description]
     */
    _createSymbolizers:function() {
        var symbol = this._getSymbol();
        var symbolizers = [];
        for (var i = this.registerSymbolizers.length - 1; i >= 0; i--) {
            if (this.registerSymbolizers[i].test(this.geometry, symbol)) {
                var symbolizer = new this.registerSymbolizers[i](symbol, this.geometry);
                symbolizers.push(symbolizer);
                if (symbolizer instanceof Z.PointSymbolizer) {
                    this._hasPointSymbolizer = true;
                }
            }
        }
        if (symbolizers.length === 0) {
            throw new Error("no symbolizers can be created to draw, check the validity of the symbol.");
        }
        return symbolizers;
    },

    hasPointSymbolizer:function() {
        return this._hasPointSymbolizer;
    },

    _getSymbol:function() {
        return this.geometry.getSymbol();
    },

    /**
     * 绘制图形
     */
    paint:function() {
        var contexts = this.geometry.getLayer()._getRender().getPaintContext();
        if (!contexts || !this.symbolizers) {
            return;
        }
        var layer = this.geometry.getLayer();
        var isCanvas = layer.isCanvasRender();
        for (var i = this.symbolizers.length - 1; i >= 0; i--) {
            var symbolizer = this.symbolizers[i];
            if (isCanvas) {
                symbolizer.canvas.apply(symbolizer, contexts);
            } else {
                symbolizer.svg.apply(symbolizer, contexts.concat(this._registerEvents, this));
            }
        }
        this._painted = true;
    },

    _registerEvents:function() {
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            return;
        }
        //svg类型
        var geometry = this.geometry;
        var doms = this.getSvgDom();
        if (Z.Util.isArrayHasData(doms)) {
            for (var j = doms.length - 1; j >= 0; j--) {
                Z.DomUtil.on(doms[j], 'mousedown mouseup click dblclick contextmenu', geometry._onEvent, geometry);
                Z.DomUtil.on(doms[j], 'mouseover', geometry._onMouseOver, geometry);
                Z.DomUtil.on(doms[j], 'mouseout', geometry._onMouseOut, geometry);
            }
        }
    },

    /**
     * 获取svg图形的dom
     */
    getSvgDom:function() {
        var result = [];
        for (var i = this.symbolizers.length - 1; i >= 0; i--) {
            var doms = this.symbolizers[i].getSvgDom();
            result = result.concat(doms);
        }
        return result;
    },


    _eachSymbolizer:function(fn,context) {
        if (!this.symbolizers) {
            return;
        }
        if (!context) {
            context = this;
        }
        for (var i = this.symbolizers.length - 1; i >= 0; i--) {
            fn.apply(context,[this.symbolizers[i]]);
        }
    },

    //需要实现的接口方法
    getPixelExtent:function() {
        if (!this._viewExtent) {
            if (this.symbolizers) {
                var viewExtent = new Z.Extent();
                var len = this.symbolizers.length - 1;
                for (var i = len; i >= 0; i--) {
                    viewExtent._combine(this.symbolizers[i].getPixelExtent());
                }
                viewExtent._round();
                this._viewExtent = viewExtent;
            }
        }
        return this._viewExtent;
    },

    setZIndex:function(change) {
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.setZIndex(change);
        });
    },

    show:function(){
        if (!this._painted) {
            var layer = this.geometry.getLayer();
            if (!layer.isCanvasRender()) {
                this.paint();
            }
        } else {
            this._eachSymbolizer(function(symbolizer) {
                symbolizer.show();
            });
        }
        this._rendCanvas(false);
    },

    hide:function(){
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.hide();
        });
        this._rendCanvas(false);
    },

    onZoomEnd:function() {
        this._refreshSymbolizers();
    },

    repaint:function(){
        this._refreshSymbolizers();
        this._rendCanvas(false);
    },

    _refreshSymbolizers:function() {
        this._removeCache();
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.refresh();
        });
    },

    _rendCanvas:function(needPromise) {
        if (!this.geometry.getMap() || this.geometry.getMap().isBusy()) {
            // console.log('is busy do not refresh painter');
            return;
        }
        var layer = this.geometry.getLayer();
        //check if geometry's resources have already loaded, if not, layer render needs to promise to load resources at first.
        var resources = this.geometry._getExternalResource();
        if (!needPromise && Z.Util.isArrayHasData(resources)) {
            for (var i = resources.length - 1; i >= 0; i--) {
            if (!layer._getRender().isResourceLoaded(resources[i])) {
                    needPromise = true;
                    break;
                }
            }
        }
        if (layer.isCanvasRender()) {
            var isRealTime = !needPromise && ((this.geometry.isEditing && this.geometry.isEditing())
                                || (this.geometry.isDragging && this.geometry.isDragging()));
            var render = this.geometry.getLayer()._getRender();
            if (!render) {
                return;
            }
            if (isRealTime) {
                render.renderImmediate();
            } else {
                render.render(null,!needPromise);
            }
        }
    },

    /**
     * symbol发生变化后, 刷新symbol
     */
    refreshSymbol:function() {
        this._removeCache();
        this._removeSymbolizers();
        this.symbolizers = this._createSymbolizers();
        if (!this._painted) {
            return;
        }
        // console.log('painter refreshSymbol');
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            this._rendCanvas(true);
        } else {
            this.paint();
        }
    },

    remove:function() {
        this._removeCache();
        this._removeSymbolizers();
    },

    _removeSymbolizers:function() {
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.remove();
        });
        delete this.symbolizers;
    },

    /**
     * 删除缓存属性
     */
    _removeCache:function() {
        delete this._viewExtent;
    }
});
