Z.Painter = Z.Class.extend({
    //注册的symbolizer
    registerSymbolizers : [
        Z.StrokeAndFillSymbolizer,
        Z.ImageMarkerSymbolizer,
        Z.VectorMarkerSymbolizer
    ],

    initialize:function(geometry) {
        this.geometry = geometry;
        this._createSymbolizers();
    },

    /**
     * 监听geometry事件
     */
    _registerEvents:function() {
        this.geometry.on('symbolchanged', function(param) {
            this.remove();
            this._createSymbolizers();
            this.paint.apply(this, this.context);
        }, this);
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
     * @param  {Geometry} geometry 要绘制的图形
     */
    paint:function() {
        this._saveContext.apply(this, arguments);
        for (var i = this.symbolizers.length - 1; i >= 0; i--) {
            this.symbolizers[i].symbolize.apply(this.symbolizers[i], arguments);
        }
    },

    /**
     * 保存paint被调用时的参数context, 以备未来刷新symbolizer时使用
     */
    _saveContext:function() {
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
    setZIndex:function(change) {
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.setZIndex();
        });
    },

    show:function(){
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.show();
        });
    },

    hide:function(){
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.hide();
        });
    },

    refresh:function(){
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.refresh();
        });
    },

    remove:function() {
        this._eachSymbolizer(function(symbolizer) {
            symbolizer.remove();
        });
    }

});