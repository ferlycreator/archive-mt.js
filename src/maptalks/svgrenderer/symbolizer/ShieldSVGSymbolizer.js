Z.ImageMarkerSVGSymbolizer = Z.ImageMarkerSymbolizer.extend({
    symbolize:function(container, vectorcontainer, zIndex, _container, _vectorcontainer, painter) {
        if (!this.shieldFile) {
            var me = this;
            var img = new Image();
            var svgContainer = (_vectorcontainer && _vectorcontainer.appendChild)?_vectorcontainer:vectorcontainer;
            img.onload=function() {
                me.shieldFileWidth = this.width;
                me.shieldFileHeight = this.height;
                me.shieldFile = this;
                me._svgMarkers(svgContainer,zIndex);
                if (painter) {
                    painter._registerEvents();
                }
            };
            Z.Util.loadImage(img, this.symbol['shieldFile']);
            //img.src=this.symbol['shieldFile'];
        } else {
            this._svgMarkers(vectorcontainer,zIndex);
        }

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
        var textSize = this.textDesc['size'];
        var svgText = Z.SVG.text(this.textContent, textStyle, textSize);
        Z.SVG.updateTextStyle(svgText, textStyle, textSize);
        var strokeAndFill = this.translateStrokeAndFill(textStyle);
        Z.SVG.updateShapeStyle(svgText, strokeAndFill['stroke'], strokeAndFill['fill']);
        this._offsetMarker(svgText, new Z.Point(style['textDx'], style['textDy']));
        svgGroup.appendChild(svgText);
        return svgGroup;
    }
});
