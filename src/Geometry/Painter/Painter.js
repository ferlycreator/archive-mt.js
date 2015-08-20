
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
        strokeSymbol['stroke'] = symbol['lineColor'];
        strokeSymbol['strokeWidth'] = symbol['lineWidth'];
        strokeSymbol['strokeDasharray'] = symbol['lineDasharray'];
        strokeSymbol['strokeOpacity'] = symbol['lineOpacity'];

        if (symbol['markerLineWidth'] || symbol['markerLineColor']) {
            strokeSymbol['stroke'] = symbol['markerLineColor'];
            strokeSymbol['strokeDasharray'] = symbol['lineDasharray'];
            strokeSymbol['strokeWidth'] = symbol['markerLineWidth'];
            //markerOpacity优先级较高
            strokeSymbol['strokeOpacity'] = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerLineOpacity']);
        }
        return strokeSymbol;
    },

    /**
     * 构造填充渲染所需的symbol字段
     */
    prepareFillSymbol:function(symbol) {
        var fillSymbol = {};
        fillSymbol['fill'] = symbol['polygonFill'];
        if (symbol['polygonPatternFile']) {
            fillSymbol['fill'] = symbol['polygonPatternFile'];
        }
        fillSymbol['fillOpacity'] = (!Z.Util.isNil(symbol['polygonOpacity'])?symbol['polygonOpacity']:symbol['polygonPatternOpacity']);

        if (symbol['markerFill'] || symbol['markerFillOpacity']) {
            fillSymbol['fill'] = symbol['markerFill'];
            //markerOpacity优先级较高
            fillSymbol['fillOpacity'] = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerFillOpacity']);
        }
        return fillSymbol;
    },

    prepareIcon: function(symbol) {
        for(var attr in symbol) {
            var url = symbol['markerFile'];
            if (url&&url.length>0) {
               symbol['markerType'] = null;
               symbol['textName'] = null;
               break;
            }
            var markerType = symbol['markerType'];
            if(markerType&&markerType.length>0) {
                symbol['markerFile'] = null;
                symbol['textName'] = null;
                break;
            }
            var textName = symbol['textName'];
            if(textName&&textName.length>0) {
                symbol['markerFile'] = null;
                symbol['markerType'] = null;
                break;
            }
        }
        var icon = {
            ////icon
           'url': symbol['markerFile'],
           'width': symbol['markerWidth'],
           'height': symbol['markerHeight'],
           'type': symbol['markerType'],
           'opacity': symbol['markerOpacity'],
           'fillOpacity': symbol['markerFillOpacity'],
           'fill': symbol['markerFill'],
           'stroke': symbol['markerLineColor'],
           'strokeWidth': symbol['markerLineWidth'],
           'strokeDasharray': symbol['markerLineDasharray'],
           'strokeOpacity': symbol['markerLineOpacity'],

           /////text
           'content': symbol['textName'],
           'font': symbol['textFaceName'],
           'size': symbol['textSize'],
           'textwidth': symbol['textWrapWidth'],
           'padding': symbol['textSpacing'],
           'color': symbol['textFill'],
           'textopacity': symbol['textOpacity'],
           'align': symbol['textAlign'],
           'vertical': symbol['textVerticalAlignment'],
           'horizontal': symbol['textHorizontalAlignment'],
           'placement': symbol['textPlacement'],//point line vertex interior
           'dx': symbol['textDx'],
           'dy' : symbol['textDy']
        };
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