Z.Vector = Z.Geometry.extend({
    options:{
        'symbol':{
            'lineColor' : '#ff0000',
            'lineWidth' : 2,
            'lineOpacity' : 1,
            'lineDasharray': '',
            'polygonFill' : '#ffffff',
            'polygonOpacity' : 1
        }
    },

    _hitTestTolerance: function() {
        var w = this.options.symbol.strokeWidth || this.options.symbol.lineWidth;
        return w ? w / 2 : 0;
    },

    _computeVisualExtent:function(projection) {
        /*var strokeSymbol = this.getStrokeSymbol();*/
        var width = 0;
        /*if (!strokeSymbol) {
            strokeSymbol = this.getDefaultStrokeSymbol();
        }
        if (strokeSymbol) {
            width = strokeSymbol['strokeWidth'];
            if (!width) {
                width = strokeSymbol['stroke-width'];
            }
        }
        if (!width) {
            width = 1;
        }       */
        var extent = this._getPrjExtent();
        var map = this.getMap();
        var res = map._getTileConfig().getResolution(map.getZoomLevel());
        var expanded =  Z.Extent.expand(extent,res*width);
        if (!expanded) {
            return null;
        }
        return new Z.Extent(projection.unproject({x:expanded['xmin'],y:expanded['ymin']}),projection.unproject({x:expanded['xmax'],y:expanded['ymax']}));
    }
});
