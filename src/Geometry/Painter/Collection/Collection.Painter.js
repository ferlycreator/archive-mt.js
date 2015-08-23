Z.GeometryCollection.Painter=Z.Painter.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    _paint:function() {
        if (!this.geometry) {
            return;
        }
        var symbol = this.geometry.getSymbol();
        //将collection的symbol放到末尾,覆盖painter原有的symbol
        Array.prototype.push.call(arguments, symbol);

        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter.paint.apply(painter,arguments);}
        }
    },

    remove:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter.remove.apply(painter,arguments);}
        }
    },

    _setZIndex:function(change) {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter._setZIndex.apply(painter,arguments);}
        }
    },

    show:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter.show.apply(painter,arguments);}
        }
    },

    hide:function() {
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            if (painter) {painter.hide.apply(painter,arguments);}
        }
    },

    refresh:function(){
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            painter.setSymbol(this.geometry.getSymbol());
            if (painter) {painter.refresh.apply(painter,arguments);}
        }
    },

    refreshSymbol:function(){
        var geometries = this.geometry.getGeometries();
        for (var i=0,len=geometries.length;i<len;i++) {
            var painter = geometries[i]._getPainter();
            painter.setSymbol(this.geometry.getSymbol());
            if (painter) {painter.refreshSymbol.apply(painter,arguments);}
        }
    },

    _registerEvents:function() {
        //TODO GeometryCollection类型数据的处理
    }
});