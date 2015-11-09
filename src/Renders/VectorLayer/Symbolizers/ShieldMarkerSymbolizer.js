Z.ShieldMarkerSymbolizer = Z.PointSymbolizer.extend({
    defaultSymbol:{
        "shieldFile"       : null,
        "shieldOpacity"    :  1,
        "shieldDx"         :  0,
        "shieldDy"         :  0,

        "shieldFaceName"  : "arial",
        "shieldSize"       :  10,
        "shieldFill"       : "#000000",
        "shieldTextOpacity": 1,
        "shieldHaloFill"  : "#ffffff",
        "shieldHaloRadius": 0,

        "shieldTextDx"    :  0,
        "shieldTextDy"    :  0,

        "shieldHorizontalAlignment"   : "middle", //left | middle | right | auto
        "shieldVerticalAlignment"     : "middle",   // top | middle | bottom | auto
        "shieldJustifyAlignment"      : "left" //left | right | center | auto
    },

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.renderPoints = this._getRenderPoints();
        this.style = this.translate();
        this.strokeAndFill = this.translateStrokeAndFill(this.style);
        var props = this.geometry.getProperties();
        this.textContent = Z.Util.content(this.style['shieldName'], props);
        this.textSize = Z.Util.stringLength(this.textContent,this.style['textFaceName'],this.style['textSize']);
    },

    svg:function(container, vectorcontainer, zIndex, _container, _vectorcontainer) {
        if (this.symbol['shieldFile']) {
            var me = this;
            var img = new Image();
            var svgContainer = _vectorcontainer || vectorcontainer;
            img.onload=function() {
                me.shieldFileWidth = this.width;
                me.shieldFileHeight = this.height;
                me._svgMarkers(svgContainer,zIndex);
            };
            img.src=this.symbol['shieldFile'];
        } else {
            this._svgMarkers(vectorcontainer,zIndex);
        }

    },

    canvas:function(ctx, resources) {
        var points = this.renderPoints;
        if (!Z.Util.isArrayHasData(points)) {
            return;
        }
        Z.Canvas.setDefaultCanvasSetting(ctx);

        var style = this.style,
            strokeAndFill = this.strokeAndFill;
        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'], strokeAndFill['fill'], resources);
        Z.Canvas.prepareCanvasFont(ctx,style);

        var map = this.getMap();
        var cookedPoints = Z.Util.eachInArray(points,this,function(point) {
            return map._viewPointToContainerPoint(point);
        });
        var img = resources.getImage(style['shieldFile']);
        for (var i = 0, len=cookedPoints.length;i<len;i++) {
            var pt = cookedPoints[i];
            Z.Canvas.shield(ctx, pt, img, this.textContent, this.textSize, style);
        }
    },

    getPlacement:function() {
        return this.symbol['shieldPlacement'];
    },

    getDxDy:function() {
        var s = this.style;
        var dx = s['shieldDx'],
            dy = s['shieldDy'];
        return new Z.Point(dx, dy);
    },

    getMarkerExtent:function() {
        var dxdy = this.getDxDy(),
            style = this.style,
            size = this.textSize;
        var fileExtent = new Z.Extent(dxdy.add(-this.shieldFileWidth/2, - this.shieldFileHeight/2),
                    dxdy.add(this.shieldFileWidth/2, this.shieldFileHeight/2));
        var textDxDy = new Z.Point(this.style['textDx'], this.style['textDy']);
        var alignW, alignH;
        if (style['textHorizontalAlignment'] === 'left') {
            alignW = this.textSize['width'];
        } else if (style['textHorizontalAlignment'] === 'middle') {
            alignW = this.textSize['width']/2;
        } else if (style['textHorizontalAlignment'] === 'right') {
            alignW = 0;
        }
        if (style['textVerticalAlignment'] === 'top') {
            alignH = this.textSize['height'];
        } else if (style['textVerticalAlignment'] === 'middle') {
            alignH = this.textSize['height']/2;
        } else if (style['textVerticalAlignment'] === 'bottom') {
            alignH = 0;
        }
        var textExtent = new Z.Extent(
            textDxDy.add(new Z.Point(alignW, alignH)),
            textDxDy.add(new Z.Point(alignW-size['width'],alignH-size['height']))
        );
        return fileExtent.combine(textExtent);
    },

    translate:function() {
        var s = this.symbol;
        var d = this.defaultSymbol;
        var result =  {
            "shieldName"       : s['shieldName'],

            "shieldFile"       : Z.Util.getValueOrDefault(s['shieldFile'],d['shieldFile']),
            "shieldOpacity"    :  Z.Util.getValueOrDefault(s['shieldOpacity'],d['shieldOpacity']),

            "shieldDx"         :  Z.Util.getValueOrDefault(s['shieldDx'],d['shieldDx']),
            "shieldDy"         :  Z.Util.getValueOrDefault(s['shieldDy'],d['shieldDy']),

            "textFaceName"  : Z.Util.getValueOrDefault(s['shieldFaceName'],d['shieldFaceName']),
            "textSize"       : Z.Util.getValueOrDefault(s['shieldSize'],d['shieldSize']),
            "textFill"       : Z.Util.getValueOrDefault(s['shieldFill'],d['shieldFill']),
            "textOpacity"    : Z.Util.getValueOrDefault(s['shieldTextOpacity'],d['shieldTextOpacity']),
            "textHaloFill"  : Z.Util.getValueOrDefault(s['shieldHaloFill'],d['shieldHaloFill']),
            "textHaloRadius": Z.Util.getValueOrDefault(s['shieldHaloRadius'],d['shieldHaloRadius']),
            "textLineSpacing": 0,

            "textDx"    :  Z.Util.getValueOrDefault(s['shieldTextDx'],d['shieldTextDx']),
            "textDy"    :  Z.Util.getValueOrDefault(s['shieldTextDy'],d['shieldTextDy']),

            "textHorizontalAlignment"   : Z.Util.getValueOrDefault(s['shieldHorizontalAlignment'],d['shieldHorizontalAlignment']),
            "textVerticalAlignment"     : Z.Util.getValueOrDefault(s['shieldVerticalAlignment'],d['shieldVerticalAlignment']),
            "textAlign"                  : Z.Util.getValueOrDefault(s['shieldJustifyAlignment'],d['shieldJustifyAlignment'])
        };
        return result;
    },

    /**
     * 生成图片标注
     * @param point
     */
    createMarkerDom: function() {
        var style = this.style;
        var svgGroup = Z.SVG.group();
         if (style['shieldFile']) {
            var svgImage = Z.SVG.image(style['shieldFile'],this.shieldFileWidth,this.shieldFileHeight);
            this._offsetMarker(svgImage, new Z.Point(-this.shieldFileWidth/2, -this.shieldFileHeight/2));
            svgGroup.appendChild(svgImage);
        }
        var textStyle = this.style;
        var svgText = Z.SVG.text(this.textContent, textStyle, this.textSize);
        Z.SVG.updateTextStyle(svgText, textStyle, this.textSize);
        var strokeAndFill = this.translateStrokeAndFill(textStyle);
        Z.SVG.updateShapeStyle(svgText, strokeAndFill['stroke'], strokeAndFill['fill']);
        this._offsetMarker(svgText, new Z.Point(style['textDx'], style['textDy']));
        svgGroup.appendChild(svgText);
        return svgGroup;
    },


    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['textHaloFill'],
                "stroke-width" : s['textHaloRadius'],
                "stroke-opacity" : s['textOpacity'],
                "stroke-dasharray": null,
                "stroke-linecap" : "butt",
                "stroke-linejoin" : "round"
            },

            "fill" : {
                "fill"          : s["textFill" ],
                "fill-opacity"  : s["textOpacity"]
            }
        };
        //vml和svg对linecap的定义不同
        if (result['stroke']['stroke-linecap'] === "butt") {
            if (Z.Browser.vml) {
                result['stroke']['stroke-linecap'] = "flat";
            }
        }
        return result;
    }

});



Z.ShieldMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (!Z.Util.isNil(symbol['shieldName'])) {
        return true;
    }
    return false;
};
