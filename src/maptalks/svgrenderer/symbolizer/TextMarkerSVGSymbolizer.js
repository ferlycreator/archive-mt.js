Z.TextMarkerSVGSymbolizer = Z.TextMarkerSymbolizer.extend({
    svg:function(container, vectorcontainer, zIndex) {
        this._svgMarkers(vectorcontainer,zIndex);
    },

    /**
     * 生成文字标注
     * @param point
     */
    createMarkerDom: function() {
        var style = this.style,
            textContent = this.textContent,
            size = this.textSize,
            strokeAndFill = this.strokeAndFill;

        var svgText = Z.SVG.text(textContent, style, size);
        Z.SVG.updateTextStyle(svgText, style, size);
        Z.SVG.updateShapeStyle(svgText, strokeAndFill['stroke'], strokeAndFill['fill']);
        return svgText;
    }
});
