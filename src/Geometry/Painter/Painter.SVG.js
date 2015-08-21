Z.Painter.SVG = Z.Painter.extend({

    /**
     * 绘制矢量Geometry
     * @param layer
     * @param config
     */
    drawVector:function(vectorBean, strokeSymbol, fillSymbol, icon) {
        var vectorPaper = this.getVectorPaper();
        if (!vectorBean || !vectorPaper) {return;}
        //样式
        if (this.vector) {
            // TODO: only update?
            Z.SVG.removeVector(vectorPaper, this.vector);
        }
        var path = Z.SVG.addVector(vectorPaper, vectorBean,
                                   Z.Util.convertFieldNameStyle(strokeSymbol,'minus'),
                                   Z.Util.convertFieldNameStyle(fillSymbol,'minus'),
                                   Z.Util.convertFieldNameStyle(icon,'minus'));
        this.vector = path;
        return this.vector;
    },

    remove:function() {
        if (this.vector) {
            var vectorPaper = this.getVectorPaper();
            Z.SVG.removeVector(vectorPaper, this.vector);
            delete this.vector;
        }
        if (this.markerDom) {
            Z.DomUtil.removeDomNode(this.markerDom);
            delete this.markerDom;
        }
    },

    refreshSymbol:function() {
        if (!this.geometry) {return;}
        if (Z.Geometry['TYPE_POINT'] === this.geometry.getType()) {
            var icon = this.getGeoIcon();
            if(icon['url'] && icon['url'].length>0) {
                this.refreshMarkerSymbol();
            } else {
                this.refreshMarker();
            }
        } else {
            this.refreshVectorSymbol();
        }
    },

    /**
     * 刷新Graphic的位置,主要用在缩放地图
     */
    refresh:function() {
        if (this.geometry.type === Z.Geometry['TYPE_POINT']) {
            var icon = this.getGeoIcon();
            if(icon['url'] && icon['url'].length>0) {
                this.refreshMarkerSymbol();
            } else {
                this.refreshMarker();
            }
        } else {
            var vectorBean = this.createSVGObj();
            Z.SVG.refreshVector(this.vector, vectorBean);
        }
        this.registerEvents();
    },

    registerEvents:function(){
        var targetDom = this.vector || this.markerDom;
        targetDom && this.addDomEvents(targetDom);
    },

    setZIndex:function(change) {
        if (this.markerDom) {
            this.markerDom.style.zIndex = change;
        }
        if (this.vector) {
            this.vector.style.zIndex = change;
        }
    },

    show:function() {
        if (this.markerDom) {
            this.markerDom.style.display='';
        }
        if (this.vector) {
            this.vector.show();
        }
    },

    hide:function() {
        if (this.markerDom) {
            this.markerDom.style.display = 'none';
        }
        if (this.vector) {
            this.vector.hide();
        }
    },

    convertPropToCssStyle:function(symbol) {
        if (!symbol) {
            return null;
        }
        var option = {};
        for (var p in symbol) {
            if (symbol.hasOwnProperty(p)) {
                if (p === "") {continue;}
                option[Z.Util.convertCamelToMinus(p)]=symbol[p];
            }
        }
        return option;

    },

    setVectorPaper:function(paper) {
        this.vectorPaper = paper;
    },

    getVectorPaper:function() {
        if (this.vectorPaper) {
            return this.vectorPaper;
        }
        if (!this.geometry || !this.geometry.getMap()) {
            return null;
        }
        var map = this.geometry.getMap();
        map._createSVGPaper();
        return map.vectorPaper;
    }
});