Z.Util.extend(Z.Painter.prototype, {
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
    }

});
