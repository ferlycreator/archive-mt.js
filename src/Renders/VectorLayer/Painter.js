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
        this._createSymbolizers();
    },

    /**
     * 构造symbolizers
     * @return {[type]} [description]
     */
    _createSymbolizers:function() {
        var symbol = this._getSymbol();
        this.symbolizers = [];
        for (var i=0, len=this.registerSymbolizers.length;i<len;i++) {
            if (this.registerSymbolizers[i].test(this.geometry, symbol)) {
                this.symbolizers.push(new this.registerSymbolizers[i](symbol, this.geometry));
            }
        }
    },

    _getSymbol:function() {
        return this.geometry.getSymbol();
    },

    /**
     * 绘制图形
     */
    paint:function() {
        this._saveContext.apply(this, arguments);
        for (var i = this.symbolizers.length - 1; i >= 0; i--) {
            this.symbolizers[i].symbolize.apply(this.symbolizers[i], arguments);
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

    /**
     * 保存paint被调用时的参数context, 以备未来刷新symbolizer时使用
     */
    _saveContext:function() {
        //context只需要save一次即可
        if (this.context) {
            return;
        }
        var layer = this.geometry.getLayer();
        if (layer.isCanvasRender()) {
            this.context = arguments;
        } else {
            //第3和第4个参数是真正的容器, 第1和第2个是为了提高效率而临时构造出来的fragment
            this.context = [arguments[3], arguments[4]];
        }
    },

    _eachSymbolizer:function(fn,context) {
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
            this.pxExtent = new Z.Extent();
            for (var i = this.symbolizers.length - 1; i >= 0; i--) {
                this.pxExtent = Z.Extent.combine(this.symbolizers[i].getPixelExtent(),this.pxExtent);
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
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.show();
        });
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
        this._removeSymbolizers();
        this._createSymbolizers();
        this.paint.apply(this, this.context);
    },

    remove:function() {
        delete this.context;
        this._removeSymbolizers();
    },

    _removeSymbolizers:function() {
        delete this.pxExtent;
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.remove();
        });
    }
});
