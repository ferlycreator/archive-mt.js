Z.Painter.SVG = Z.Painter.extend({

    /**
     * 绘制矢量Geometry
     * @param layer
     * @param config
     */
    drawVector: function(vectorBean, strokeSymbol, fillSymbol) {
        var vectorPaper = this._getVectorPaper(vectorBean);
        this.vector = Z.SVG.addVector(vectorPaper, vectorBean, strokeSymbol, fillSymbol);
        return this.vector;
    },

    drawTextVector: function(vectorBean, iconSymbol) {
        var vectorPaper = this.getVectorPaper(vectorBean);
        this.vector = Z.SVG.addTextVector(vectorPaper, vectorBean, iconSymbol);
        return this.vector;
    },

    drawShieldVector: function(vectorBean, strokeSymbol, fillSymbol, shieldSymbol) {
        var vectorPaper = this.getVectorPaper(vectorBean);
        this.vector = Z.SVG.addShieldVector(vectorPaper, vectorBean, strokeSymbol, fillSymbol, shieldSymbol);
        return this.vector;
    },

    _getVectorPaper: function(vectorBean) {
        var vectorPaper = this.getVectorPaper();
        if (!vectorBean || !vectorPaper) {return;}
        //样式
        if (this.vector) {
            // TODO: only update?
            Z.SVG.removeVector(vectorPaper, this.vector);
        }
        return vectorPaper;
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

    refreshSymbol: function() {
        if (!this.geometry) {return;}
        if (Z.Geometry['TYPE_POINT'] === this.geometry.getType()) {
            this.refreshMarker();
        } else {
            this.refreshVectorSymbol();
        }
    },

    /**
     * 刷新Graphic的位置,主要用在缩放地图
     */
    refresh:function() {
        if (this.geometry.type === Z.Geometry['TYPE_POINT']) {
            this.refreshMarker();
        }  else {
            this.refreshVectorSymbol();
        }
        this._registerEvents();
    },

    _registerEvents:function(){
        var targetDom = this.vector || this.markerDom;
        targetDom && this.addDomEvents(targetDom);
    },

    _setZIndex:function(change) {
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
            this.vector.style.display = '';
        }
    },

    hide:function() {
        if (this.markerDom) {
            this.markerDom.style.display = 'none';
        }
        if (this.vector) {
            this.vector.style.display = 'none';
        }
    },

    convertPropToCssStyle:function(symbol) {
        if (!symbol) {
            return null;
        }
        var option = {};
        for (var p in symbol) {
            if (symbol.hasOwnProperty(p)) {
                if (p === '') {continue;}
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