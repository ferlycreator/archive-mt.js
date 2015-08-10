
Z.Painter = Z.Class.extend({
    includes:[Z.Eventable],
    paint:function() {
        if (!this.geometry || !this.geometry.isVisible()) {
            return;
        }
        this._paint.apply(this,arguments);
        this.registerEvents();
    },

    setSymbol:function(_symbol) {
        var symbol = _symbol;
        if (!symbol) {
            symbol = this.geometry.getSymbol();
            if (!symbol) {
                symbol = this.geometry.getDefaultSymbol();
            }
        }
        //如果有cartoCSS定义, 则优先载入cartoCSS中的symbol
        var map = this.geometry.getMap();
        if (map.options['enableCartoCSS']) {
            var cartoSymbol = map.cartoCSSGeometry(this.geometry);
            if (cartoSymbol) {
                symbol = Z.Util.convertFieldNameStyle(cartoSymbol,'camel');
            }
        }

        this.strokeSymbol = this.prepareStrokeSymbol(symbol);
        this.fillSymbol = this.prepareFillSymbol(symbol);
        this.iconSymbol = this.prepareIcon(symbol);
    },

    /**
     * 构造线渲染所需的symbol字段
     */
    prepareStrokeSymbol:function(symbol) {
        var strokeSymbol = {};
        if (this.geometry.isVector()) {
            strokeSymbol['stroke'] = symbol['lineColor'];
            strokeSymbol['strokeWidth'] = symbol['lineWidth'];
            strokeSymbol['strokeDasharray'] = symbol['lineDasharray'];
            strokeSymbol['strokeOpacity'] = symbol['lineOpacity'];
        } else {
            //如果有marker-file,则忽略其他的样式
            if (!symbol['markerFile']) {
                strokeSymbol['stroke'] = symbol['markerLineColor'];
                strokeSymbol['strokeWidth'] = symbol['markerLineWidth'];
                //markerOpacity优先级较高
                strokeSymbol['strokeOpacity'] = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerLineOpacity']);
            }
        }
        return strokeSymbol;
    },

    /**
     * 构造填充渲染所需的symbol字段
     */
    prepareFillSymbol:function(symbol) {
        var fillSymbol = {};
        if (this.geometry.isVector()) {
            fillSymbol['fill'] = symbol['polygonFill'];

            if (symbol['polygonPatternFile']) {
                fillSymbol['fill'] = symbol['polygonPatternFile'];

            }
            fillSymbol['fillOpacity'] = (!Z.Util.isNil(symbol['polygonOpacity'])?symbol['polygonOpacity']:symbol['polygonPatternOpacity']);
        } else {
            //如果有marker-file,则忽略其他的样式
            if (!symbol['markerFile']) {
                fillSymbol['fill'] = symbol['markerFill'];
                //markerOpacity优先级较高
                fillSymbol['fillOpacity'] = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerFillOpacity']);
            }
        }
        return fillSymbol;
    },

    prepareIcon:function(symbol) {
        var icon = null;
        if (!this.geometry.isVector()) {
            if (symbol['markerFile']) {
                icon = {
                    'type':'picture',
                    'url':symbol['markerFile'],
                    'width':symbol['markerWidth'],
                    'height':symbol['markerHeight']
                };
            } else if (symbol['text-name']){
                //文字
                icon = {
                    'type':'text'
                };
            } else {
                icon = {
                    'type':'vector',
                    'style':symbol['markerType'],
                    'size':symbol['markerWidth']
                };
            }
        }
        return icon;
    },

    //需要实现的接口方法
    setZIndex:function(change) {
        throw new Error("not implemented");
    },

    show:function(){
        throw new Error("not implemented");
    },

    hide:function(){
        throw new Error("not implemented");
    },

    refresh:function(){
        throw new Error("not implemented");
    },

    remove:function() {
        throw new Error("not implemented");
    },

    addDomEvents:function(dom){
        var geometry = this.geometry;
        Z.DomUtil.on(dom, 'mousedown mouseup click dblclick contextmenu', geometry.onEvent, geometry);
        Z.DomUtil.on(dom, 'mouseover', geometry.onMouseOver, geometry);
        Z.DomUtil.on(dom, 'mouseout', geometry.onMouseOut, geometry);
    }

});