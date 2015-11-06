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

    paint:function() {
        if (!this.geometry) {
            return;
        }
        var symbol = this.geometry.getSymbol();
        //将collection的symbol放到末尾,覆盖painter原有的symbol
        Array.prototype.push.call(arguments, symbol);
        var args = arguments;
        this._eachPainter(function(painter) {
            painter.paint.apply(painter,args);
        });
        // this._registerEvents();
    },

    getPixelExtent:function() {
        var  extent = new Z.Extent();
        this._eachPainter(function(painter) {
            extent = extent.combine(painter.getPixelExtent());
        });
        return extent;
    },

    remove:function() {
        var args = arguments;
        this._eachPainter(function(painter) {
            painter.remove.apply(painter,args);
        });
    },

    setZIndex:function(change) {
        var args = arguments;
        this._eachPainter(function(painter) {
            painter.setZIndex.apply(painter,args);
        });
    },

    show:function() {
        var args = arguments;
        this._eachPainter(function(painter) {
            painter.show.apply(painter,args);
        });
    },

    hide:function() {
        var args = arguments;
        this._eachPainter(function(painter) {
            painter.hide.apply(painter,args);
        });
    },

    onZoomEnd:function() {
        var args = arguments;
        this._eachPainter(function(painter) {
            // painter.setSymbol(this.geometry.getSymbol());
            painter.onZoomEnd.apply(painter,args);
        });
    },

    repaint:function(){
        var args = arguments;
        this._eachPainter(function(painter) {
            // painter.setSymbol(this.geometry.getSymbol());
            painter.repaint.apply(painter,args);
        });
    },

    refreshSymbol:function(){
        var args = arguments;
        this._eachPainter(function(painter) {
            // painter.setSymbol(this.geometry.getSymbol());
            painter.refreshSymbol.apply(painter,args);
        });
    },

    /**
     * 获取svg图形的dom
     */
    getSvgDom:function() {
        var result = [];
        this._eachPainter(function(painter) {
            result = result.concat(painter.getSvgDom());
        });
        return result;
    }/*,

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
    }*/
});
