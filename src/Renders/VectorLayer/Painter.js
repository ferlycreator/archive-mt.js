Z.Painter = Z.Class.extend({
    //注册的symbolizer
    registerSymbolizers : [
        Z.StrokeAndFillSymbolizer,
        Z.ImageMarkerSymbolizer,
        Z.VectorMarkerSymbolizer,
        Z.TextMarkerSymbolizer,
        Z.ShieldMarkerSymbolizer
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
        for (var i=0, len=this.registerSymbolizers.length;i<len;i++) {
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
        this._painted = true;
        var contexts = this.geometry.getLayer()._getRender().getPaintContext();
        if (!contexts) {
            return;
        }
        for (var i = this.symbolizers.length - 1; i >= 0; i--) {
            this.symbolizers[i].symbolize.apply(this.symbolizers[i], contexts);
        }
        this._registerEvents();
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
        if (!this._painted) {
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
                    this.pxExtent = Z.Extent.combine(this.symbolizers[i].getPixelExtent(),this.pxExtent);
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
        this._rendCanvas();
    },

    hide:function(){
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.hide();
        });
        this._rendCanvas();
    },

    refresh:function(){
        this.pxExtent = null;
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.refresh();
        });
        this._rendCanvas();
    },

    _rendCanvas:function() {
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            var isRealTime = (this.geometry.isEditing && this.geometry.isEditing())
                                || (this.geometry.isDragging && this.geometry.isDragging());
            var render = this.geometry.getLayer()._getRender();
            if (isRealTime) {
                render.rendRealTime();
            } else {
                render.rend();
            }
        }
    },

    refreshSymbol:function() {
        if (!this.symbolizers) {
            return;
        }
        //判断新的symbol是否需要重新建立symbolizers
        var symbolizers = this._createSymbolizers();
        var needRefresh = false;
        if (symbolizers.length === this.symbolizers.length) {
            for (var i = this.symbolizers.length - 1; i >= 0; i--) {
                if (this.symbolizers[i].constructor!==symbolizers[i].constructor) {
                    needRefresh = true;
                    break;
                }
            }
        } else {
            needRefresh = true;
        }
        if (needRefresh) {
            this._removeSymbolizers();
            this.symbolizers = symbolizers;
            this.paint();
        }
    },

    remove:function() {
        this._removeSymbolizers();
    },

    _removeSymbolizers:function() {
        delete this.pxExtent;
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.remove();
        });
        delete this.symbolizers;
    }
});
