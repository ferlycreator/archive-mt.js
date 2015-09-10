Z.Painter = Z.Class.extend({
    //注册的symbolizer
    registerSymbolizers : [
        Z.StrokeAndFillSymbolizer
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
            this._createSymbolizers();
        }, this);
    },

    /**
     * 构造symbolizers
     * @return {[type]} [description]
     */
    _createSymbolizers:function() {
        var symbol = this.geometry.getSymbol();
        this.symbolizers = [];
        for (var i=0, len=this.registerSymbolizers.length;i<len;i++) {
            if (this.registerSymbolizers[i].test(symbol)) {
                this.symbolizers.push(new this.registerSymbolizers[i](symbol, this.geometry));
            }
        }
    },

    /**
     * 绘制图形
     * @param  {Geometry} geometry 要绘制的图形
     */
    paint:function() {
        for (var i=0, len=this.symbolizers.length;i<len;i++) {
            this.symbolizers[i].symbolize();
        }
    },

    //需要实现的接口方法
    _setZIndex:function(change) {
        throw new Error("not implemented");
    },

    show:function(){
        throw new Error("not implemented");
    },

    hide:function(){
        throw new Error("not implemented");
    },

    refresh:function(){
        this.paint();
    },

    remove:function() {
        throw new Error("not implemented");
    }

});