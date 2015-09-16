Z.ShieldMarkerSymbolizer = Z.PointSymbolizer.extend({
    defaultSymbol:{
        "shield-file"       : null,
        "shield-opacity"    :  1,
        "shield-dx"         :  0,
        "shield-dy"         :  0,

        "shield-face-name"  : "arial",
        "shield-size"       :  10,
        "shield-fill"       : "#000000",
        "shield-text-opacity": 1,
        "shield-halo-fill"  : "#ffffff",
        "shield-halo-radius": 0,

        "shield-text-dx"    :  0,
        "shield-text-dy"    :  0,

        "shield-horizontal-alignment"   : "middle", //left | middle | right | auto
        "shield-vertical-alignment"     : "middle",   // top | middle | bottom | auto
        "shield-justify-alignment"      : "left" //left | right | center | auto
    },

    initialize:function(symbol, geometry) {
        this.symbol = symbol;
        this.geometry = geometry;
        this.renderPoints = this._getRenderPoints();
    },

    svg:function(container, vectorcontainer, zIndex, _container, _vectorcontainer) {
        if (this.symbol['shield-file']) {
            var me = this;
            var img = new Image();
            img.onload=function() {
                me.shieldFileWidth = this.width;
                me.shieldFileHeight = this.height;
                me._svgMarkers(_vectorcontainer,zIndex);
            };
            img.src=this.symbol['shield-file'];
        } else {
            this._svgMarkers(vectorcontainer,zIndex);
        }

    },

    canvas:function(ctx, resources) {
        var points = this.renderPoints;
        if (!Z.Util.isArrayHasData(points)) {
            return;
        }
        var map = this.getMap();
        var cookedPoints = Z.Util.eachInArray(points,this,function(point) {
            return map._domOffsetToScreen(point);
        });
        Z.Canvas.setDefaultCanvasSetting(ctx);

        var style = this.translate();
        var textContent = this._convertContent(style['shield-name']);
        var strokeAndFill = this.translateStrokeAndFill(style);
        Z.Canvas.prepareCanvas(ctx, strokeAndFill['stroke'], strokeAndFill['fill'], resources);
        Z.Canvas.prepareCanvasFont(ctx,style);

        var size = Z.Util.stringLength(textContent,style['text-face-name'],style['text-size']);
        var ratio = Z.Browser.retina ? 2:1;

        var img = resources.getImage(style['shield-file']);

        for (var i = 0, len=cookedPoints.length;i<len;i++) {
            var pt = cookedPoints[i]._multi(ratio);
            var imgPt = pt.substract(new Z.Point(img.width/2, img.height/2));
            ctx.drawImage(img, imgPt['left'], imgPt['top'], img.width, img.height);
            Z.Canvas.text(ctx, textContent,pt , style,size);
        }
    },

    getPlacement:function() {
        return this.symbol['shield-placement'];
    },

    getDxDy:function() {
        var s = this.symbol;
        var dx = s['shield-dx'] || 0,
            dy = s['shield-dy'] || 0;
        return new Z.Point(dx, dy);
    },

    translate:function() {
        var s = this.symbol;
        var d = this.defaultSymbol;
        var result =  {
            "shield-name"       : s['shield-name'],

            "shield-file"       : Z.Util.setDefaultValue(s['shield-file'],d['shield-file']),
            "shield-opacity"    :  Z.Util.setDefaultValue(s['shield-opacity'],d['shield-opacity']),

            "shield-dx"         :  Z.Util.setDefaultValue(s['shield-dx'],d['shield-dx']),
            "shield-dy"         :  Z.Util.setDefaultValue(s['shield-dy'],d['shield-dy']),

            "text-face-name"  : Z.Util.setDefaultValue(s['shield-face-name'],d['shield-face-name']),
            "text-size"       : Z.Util.setDefaultValue(s['shield-size'],d['shield-size']),
            "text-fill"       : Z.Util.setDefaultValue(s['shield-fill'],d['shield-fill']),
            "text-opacity"    : Z.Util.setDefaultValue(s['shield-text-opacity'],d['shield-text-opacity']),
            "text-halo-fill"  : Z.Util.setDefaultValue(s['shield-halo-fill'],d['shield-halo-fill']),
            "text-halo-radius": Z.Util.setDefaultValue(s['shield-halo-radius'],d['shield-halo-radius']),


            "text-dx"    :  Z.Util.setDefaultValue(s['shield-text-dx'],d['shield-text-dx']),
            "text-dy"    :  Z.Util.setDefaultValue(s['shield-text-dy'],d['shield-text-dy']),

            "text-horizontal-alignment"   : Z.Util.setDefaultValue(s['shield-horizontal-alignment'],d['shield-horizontal-alignment']),
            "text-vertical-alignment"     : Z.Util.setDefaultValue(s['shield-vertical-alignment'],d['shield-vertical-alignment']),
            "text-align"                  : Z.Util.setDefaultValue(s['shield-justify-alignment'],d['shield-justify-alignment'])
        };
        return result;
    },

    /**
     * 生成图片标注
     * @param point
     */
    createMarkerDom: function(style) {
        var svgGroup = Z.SVG.group();

         if (style['shield-file']) {
            var svgImage = Z.SVG.image(style['shield-file'],this.shieldFileWidth,this.shieldFileHeight);
            this._offsetMarker(svgImage, new Z.Point(-this.shieldFileWidth/2, -this.shieldFileHeight/2));
            svgGroup.appendChild(svgImage);
        }
        var textStyle = this.translate();
        var textContent = this._convertContent(style['shield-name']);
        var size = Z.Util.stringLength(textContent, textStyle['text-face-name'], textStyle['text-size']);
        this.contentSize = size;
        var svgText = Z.SVG.text(textContent, textStyle, size);
        Z.SVG.updateTextStyle(svgText, textStyle, size);
        var strokeAndFill = this.translateStrokeAndFill(textStyle);
        Z.SVG.updateShapeStyle(svgText, strokeAndFill['stroke'], strokeAndFill['fill']);

        this._offsetMarker(svgText, new Z.Point(style['text-dx'], style['text-dy']));

        svgGroup.appendChild(svgText);
        return svgGroup;
    },


    translateStrokeAndFill:function(s) {
        var result = {
            "stroke" :{
                "stroke" : s['text-halo-fill'],
                "stroke-width" : s['text-halo-radius'],
                "stroke-opacity" : s['text-opacity'],
                "stroke-dasharray": null,
                "stroke-linecap" : "butt",
                "stroke-linejoin" : "round"
            },

            "fill" : {
                "fill"          : s["text-fill" ],
                "fill-opacity"  : s["text-opacity"]
            }
        };
        //vml和svg对linecap的定义不同
        if (result['stroke']['stroke-linecap'] === "butt") {
            if (Z.Browser.vml) {
                result['stroke']['stroke-linecap'] = "flat";
            }
        }
        return result;
    },

    _convertContent:function(content) {
        var regex = /\[.*\]/gi;
        if(regex.test(content)) {
            var arr = content.match(regex);
            if(arr&&arr.length>0) {
                var props = this.geometry.getProperties();
                var key = arr[0].substring(1,arr[0].length-1);
                if(props) {
                    if(props[key]) {
                        return content.replace(regex, props[key]);
                    }
                }
            }
        }
        return content;
    }
});



Z.ShieldMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (!Z.Util.isNil(symbol['shield-name'])) {
        return true;
    }
    return false;
};