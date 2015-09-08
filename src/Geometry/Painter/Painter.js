Z.Painter = Z.Class.extend({
    includes:[Z.Eventable],
    paint:function() {
        if (!this.geometry || !this.geometry.isVisible() || !this.geometry.getMap()) {
            return;
        }
        this._paint.apply(this,arguments);
        this._registerEvents();
    },

    setSymbol:function(_symbol) {
        var symbol = _symbol;
        if (!symbol) {
            symbol = this.geometry.getSymbol();
        }
        //如果有cartoCSS定义, 则优先载入cartoCSS中的symbol
        var map = this.geometry.getMap();
        if (map.options && map.options['enableCartoCSS']) {
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
        strokeSymbol['stroke'] = Z.Util.setDefaultValue(symbol['lineColor'], '#000000');
        strokeSymbol['strokeWidth'] = Z.Util.setDefaultValue(symbol['lineWidth'], 1);
        strokeSymbol['strokeDasharray'] = symbol['lineDasharray'];
        strokeSymbol['strokeOpacity'] = Z.Util.setDefaultValue(symbol['lineOpacity'], 1);

        if (symbol['markerLineWidth'] || symbol['markerLineColor']) {
            strokeSymbol['stroke'] = Z.Util.setDefaultValue(symbol['markerLineColor'], '#000000');
            strokeSymbol['strokeDasharray'] = symbol['lineDasharray'];
            strokeSymbol['strokeWidth'] = Z.Util.setDefaultValue(symbol['markerLineWidth'], 1);
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
        fillSymbol['fill'] = Z.Util.setDefaultValue(symbol['polygonFill'], '#ffffff');
        if (symbol['polygonPatternFile']) {
            fillSymbol['fill'] = symbol['polygonPatternFile'];
        }
        var fillOpacity = (!Z.Util.isNil(symbol['polygonOpacity'])?symbol['polygonOpacity']:symbol['polygonPatternOpacity']);

        if (symbol['markerFill'] || symbol['markerFillOpacity']) {
            fillSymbol['fill'] = Z.Util.setDefaultValue(symbol['markerFill'], '#ffffff');
            //markerOpacity优先级较高
            fillOpacity = (!Z.Util.isNil(symbol['markerOpacity'])?symbol['markerOpacity']:symbol['markerFillOpacity']);

        }
        if(!fillOpacity) fillOpacity = 0;
        fillSymbol['fillOpacity'] = fillOpacity;
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

        var icon = {
            ////icon
           'url': symbol['markerFile'],
           'width': Z.Util.setDefaultValue(symbol['markerWidth'], 30),
           'height': Z.Util.setDefaultValue(symbol['markerHeight'], 30),

           'type': symbol['markerType'],
           'opacity': Z.Util.setDefaultValue(symbol['markerOpacity'], 1),
           'fillOpacity': Z.Util.setDefaultValue(symbol['markerFillOpacity'],1 ),
           'fill': Z.Util.setDefaultValue(symbol['markerFill'],'#ffffff'),
           'stroke': Z.Util.setDefaultValue(symbol['markerLineColor'], '#000000'),
           'strokeWidth': Z.Util.setDefaultValue(symbol['markerLineWidth'], 1),
           'strokeDasharray': symbol['markerLineDasharray'],
           'strokeOpacity': Z.Util.setDefaultValue(symbol['markerLineOpacity'], 1),

           /////text
           'content': symbol['textName'],
           'font': Z.Util.setDefaultValue(symbol['textFaceName'], 'arial'),
           'size': Z.Util.setDefaultValue(symbol['textSize'], 12),
           'textWidth': symbol['textWrapWidth'],
           'padding': Z.Util.setDefaultValue(symbol['textSpacing'], 0),
           'color': Z.Util.setDefaultValue( symbol['textFill'], '#000000'),
           'textOpacity': Z.Util.setDefaultValue(symbol['textOpacity'], 1),
           'textAlign': Z.Util.setDefaultValue(symbol['textAlign'], 'center'),
           'vertical': Z.Util.setDefaultValue(symbol['textVerticalAlignment'], 'middle'),
           'horizontal': Z.Util.setDefaultValue(symbol['textHorizontalAlignment'], 'middle'),
           'placement': Z.Util.setDefaultValue(symbol['textPlacement'], 'point'),
           'lineSpacing': Z.Util.setDefaultValue(symbol['textLineSpacing'], 0),
           'dx': Z.Util.setDefaultValue(symbol['dx'], 0),
           'dy' : Z.Util.setDefaultValue(symbol['dy'], 0),
           'textDx': Z.Util.setDefaultValue(symbol['textDx'], 0),
           'textDy' : Z.Util.setDefaultValue(symbol['textDy'], 0)
        };
        return icon;
    },

    prepareShieldSymbol: function(symbol) {
        var shieldSymbol = {
            'shieldType': symbol['shieldType'],//label tip
            'content': symbol['shieldName'],
            'opacity': Z.Util.setDefaultValue(symbol['shieldOpacity'], 1),
            'stroke': Z.Util.setDefaultValue(symbol['shieldLineColor'], '#000000'),
            'strokeWidth': Z.Util.setDefaultValue(symbol['shieldLineWidth'], 1),
            'strokeOpacity': Z.Util.setDefaultValue(symbol['shieldLineOpacity'], 1),
            'strokeDasharray': symbol['shieldLineDasharray'],
            'fill': Z.Util.setDefaultValue(symbol['shieldFill'], '#ffffff'),
            'fillOpacity': Z.Util.setDefaultValue(symbol['shieldFillOpacity'], 1),
            'image': symbol['shieldFile'],
            'unlockImage': Z.Util.setDefaultValue(symbol['shieldUnlockImage'], false),
            'font': Z.Util.setDefaultValue(symbol['shieldFaceName'], 'arial'),
            'size': Z.Util.setDefaultValue(symbol['shieldSize'], 12),
            'color': Z.Util.setDefaultValue(symbol['shieldTextFill'], '#000000'),
            'textOpacity': Z.Util.setDefaultValue(symbol['shieldTextOpacity'], 1),
            'placement': Z.Util.setDefaultValue(symbol['shieldPlacement'], 'point'),
            'lineSpacing': Z.Util.setDefaultValue(symbol['shieldLineSpacing'], 8),
            'textWidth': symbol['shieldWrapWidth'],
            'width': Z.Util.setDefaultValue(symbol['shieldWrapWidth'],0),
            'height': Z.Util.setDefaultValue(symbol['shieldSize'], 12),
            'wrapbefore': symbol['shieldWrapBefore'],
            'wrapCharacter': symbol['shieldWrapCharacter'],
            'textDx': Z.Util.setDefaultValue(symbol['shieldTextDx'], 0),
            'textDy': Z.Util.setDefaultValue(symbol['shieldTextDy'], 0),
            'dx': Z.Util.setDefaultValue(symbol['shieldDx'], 0),
            'dy': Z.Util.setDefaultValue(symbol['shieldDy'], 0),
            'horizontal': Z.Util.setDefaultValue(symbol['shieldHorizontalAlignment'], 'middle'),//left middle right
            'vertical': Z.Util.setDefaultValue(symbol['shieldVerticalAlignment'], 'middle'),//top middle bottom
            'textAlign': Z.Util.setDefaultValue(symbol['shieldJustifyAlignment'], 'left') //left center right
        };
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
