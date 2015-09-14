Z.TextMarkerSymbolizer = Z.PointSymbolizer.extend({
    svg:function(container, vectorcontainer, zIndex) {
        this._svg(container,zIndex);
    },
});

_translate:function() {

}

Z.TextMarkerSymbolizer.test=function(geometry, symbol) {
    if (!geometry || !symbol) {
        return false;
    }
    if (Z.Util.isNil(symbol['marker-file']) && !Z.Util.isNil(symbol['text-name'])) {
        return true;
    }
    return false;
};