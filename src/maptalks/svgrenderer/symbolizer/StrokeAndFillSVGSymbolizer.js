Z.ImageMarkerSVGSymbolizer = Z.ImageMarkerSymbolizer.extend({
    symbolize:function(container, vectorContainer , zIndex) {
        var svgPath = this.geometry._getRenderPath();
        if (!this.svgDom) {
            this.svgDom = Z.SVG.path(svgPath);
            //鼠标样式
            this.svgDom.style.cursor = "pointer";
            vectorContainer.appendChild(this.svgDom);
        } else {
            Z.SVG.updatePath(this.svgDom, svgPath);
        }
        var strokeAndFill = this.strokeAndFill;
        if (this.geometry instanceof Z.Polygon) {
            Z.SVG.updateShapeStyle(this.svgDom, strokeAndFill['stroke'], strokeAndFill['fill'], this.getMap()._getRenderer().getSvgPaper());
        } else {
            Z.SVG.updateShapeStyle(this.svgDom, strokeAndFill['stroke'], {"fill": "#ffffff","fill-opacity": 0});
        }
    },

    getSvgDom:function() {
        return [this.svgDom];
    },

    refresh:function() {
        var layer = this.geometry.getLayer();
        if (!layer.isCanvasRender()) {
            this.svg.apply(this,layer._getRenderer().getPaintContext());
        }
    },

    //所有point symbolizer的共同的remove方法
    remove:function() {
        if (this.svgDom) {
            Z.DomUtil.removeDomNode(this.svgDom);
        }
    },

    setZIndex:function(zIndex) {
        if (this.svgDom) {
            this.svgDom.style.zIndex = zIndex;
        }
    },

    show:function(){
        if (this.svgDom) {
            this.svgDom.style.display = "";
        }
    },

    hide:function(){
        if (this.svgDom) {
            this.svgDom.style.display = "none";
        }
    }
});
