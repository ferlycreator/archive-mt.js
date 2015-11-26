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
                symbolizers.push(new this.registerSymbolizers[i](symbol, this.geometry));
            }
        }
        return symbolizers;
    },

    _getSymbol:function() {
        return this.geometry.getSymbol();
    },

    /**
     * 绘制图形
     */
    paint:function() {
        var contexts = this.geometry.getLayer()._getRender().getPaintContext();
        if (!contexts) {
            return;
        }
        for (var i = this.symbolizers.length - 1; i >= 0; i--) {
            this.symbolizers[i].symbolize.apply(this.symbolizers[i], contexts.concat(this._registerEvents, this));
        }
        // this._registerEvents();
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
        if (!this.pxExtent) {
            if (this.symbolizers) {
                this.pxExtent = new Z.Extent();
                for (var i = this.symbolizers.length - 1; i >= 0; i--) {
                    this.pxExtent = this.pxExtent.combine(this.symbolizers[i].getPixelExtent());
                }
            }
        }
        return this.pxExtent;
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
        if (this.geometry.getMap().isBusy()) {
            // console.log('is busy do not refresh painter');
            return;
        }
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            var isRealTime = (this.geometry.isEditing && this.geometry.isEditing())
                                || (this.geometry.isDragging && this.geometry.isDragging());
            var render = this.geometry.getLayer()._getRender();
            if (!render) {
                return;
            }
            if (isRealTime) {
                render.rendRealTime();
            } else {
                render.rend(needPromise);
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
        this._rendCanvas(false);
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
        delete this.pxExtent;
    }
});
