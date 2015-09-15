Z.CollectionPainter=Z.Class.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    _eachPainter:function(fn) {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (!painter) {
                continue;
            }
            if (painter) {fn.call(this,painter);}
        }
    },

    _paint:function() {
        if (!this.geometry) {
            return;
        }
        var symbol = this.geometry.getSymbol();
        //将collection的symbol放到末尾,覆盖painter原有的symbol
        Array.prototype.push.call(arguments, symbol);

        this._eachPainter(function(painter) {
            painter.paint.apply(painter,arguments);
        });
    },

    remove:function() {
        this._eachPainter(function(painter) {
            painter.remove.apply(painter,arguments);
        });
    },

    setZIndex:function(change) {
        this._eachPainter(function(painter) {
            painter._setZIndex.apply(painter,arguments);
        });
    },

    show:function() {
        this._eachPainter(function(painter) {
            painter.show.apply(painter,arguments);
        });
    },

    hide:function() {
        this._eachPainter(function(painter) {
            painter.hide.apply(painter,arguments);
        });
    },

    refresh:function(){
        this._eachPainter(function(painter) {
            painter.setSymbol(this.geometry.getSymbol());
            painter.refresh.apply(painter,arguments);
        });
    },

    refreshSymbol:function(){
        this._eachPainter(function(painter) {
            painter.setSymbol(this.geometry.getSymbol());
            painter.refreshSymbol.apply(painter,arguments);
        });
    },

    _registerEvents:function() {
        //TODO GeometryCollection类型数据的处理
    }
});