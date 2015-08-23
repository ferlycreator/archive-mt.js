
Z.Painter = Z.Class.extend({
    includes:[Z.Eventable],
    paint:function() {
        if (!this.geometry || !this.geometry.isVisible()) {
            return;
        }
        this._paint.apply(this,arguments);
        this._registerEvents();
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
            var cartoSymbol = map._cartoCSSGeometry(this.geometry);
            if (cartoSymbol) {
                symbol = Z.Util.convertFieldNameStyle(cartoSymbol,'camel');
            }
        }
        this.strokeSymbol = this.prepareStrokeSymbol(symbol);
        this.fillSymbol = this.prepareFillSymbol(symbol);
        this.iconSymbol = this.prepareIconSymbol(symbol);
        this.shieldSymbol = this.prepareShieldSymbol(symbol);
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

    prepareIconSymbol: function(symbol) {
        var url = symbol['markerFile'];
        var markerType = symbol['markerType'];
        var textName = symbol['textName'];
        if(!url&&!markerType&&!textName) {
            return null;
        }
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
        var width = symbol['markerWidth'];
        if(!width) {
            width = 30;
        }
        var height = symbol['markerHeight'];
        if(!height) {
            height = 30;
        }
        var textPlacement = symbol['textPlacement'];
        if(!textPlacement) {
            textPlacement = 'point';
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
           'textWidth': symbol['textWrapWidth'],
           'padding': symbol['textSpacing'],
           'color': symbol['textFill'],
           'textOpacity': symbol['textOpacity'],
           'textAlign': symbol['textAlign'],
           'vertical': symbol['textVerticalAlignment'],
           'horizontal': symbol['textHorizontalAlignment'],
           'placement': textPlacement,//point line vertex interior
           'dx': symbol['textDx'],
           'dy' : symbol['textDy']
        };
        return icon;
    },

    prepareShieldSymbol: function(symbol) {
        var shieldSymbol = {
            'shieldType': symbol['shieldType'],//label tip
            'content': symbol['shieldName'],
            'opacity': symbol['shieldOpacity'],
            'stroke': symbol['shieldLineColor'],
            'strokeWidth': symbol['shieldLineWidth'],
            'strokeOpacity': symbol['shieldLineOpacity'],
            'strokeDasharray': symbol['shieldLineDasharray'],
            'fill': symbol['shieldFill'],
            'fillOpacity': symbol['shieldFillOpacity'],
            'image': symbol['shieldFile'],
            'unlockImage': symbol['shieldUnlockImage'],
            'font': symbol['shieldFaceName'],
            'size': symbol['shieldSize'],
            'color': symbol['shieldTextFill'],
            'textOpacity': symbol['shieldTextOpacity'],
            'placement': symbol['shieldPlacement'],//point line vertex interior
            'lineSpacing': symbol['shieldLineSpacing'],
            'textWidth': symbol['shieldWrapWidth'],
            'wrapbefore': symbol['shieldWrapBefore'],
            'wrapCharacter': symbol['shieldWrapCharacter'],
            'textDx': symbol['shieldTextDx'],
            'textDy': symbol['shieldTextDy'],
            'dx': symbol['shieldDx'],
            'dy': symbol['shieldDy'],
            'horizontal': symbol['shieldHorizontalAlignment'], //left middle right
            'vertical': symbol['shieldVerticalAlignment'], //top middle bottom
            'textAlign':symbol['shieldJustifyAlignment'] //left center right
        };
        var width = symbol['shieldWrapWidth'];
        if(!width) {
            width = 30;
        }
        var height = symbol['size'];
        if(!height) {
            height = 30;
        }
        var textPlacement = symbol['textPlacement'];
        if(!textPlacement) {
            textPlacement = 'point';
        }
        shieldSymbol['width'] = width;
        shieldSymbol['height'] = height;
        shieldSymbol['placement'] = textPlacement;
        return shieldSymbol;
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
        throw new Error("not implemented");
    },

    remove:function() {
        throw new Error("not implemented");
    },

    addDomEvents:function(dom){
        var geometry = this.geometry;
        Z.DomUtil.on(dom, 'mousedown mouseup click dblclick contextmenu', geometry._onEvent, geometry);
        Z.DomUtil.on(dom, 'mouseover', geometry._onMouseOver, geometry);
        Z.DomUtil.on(dom, 'mouseout', geometry._onMouseOut, geometry);
    }

});