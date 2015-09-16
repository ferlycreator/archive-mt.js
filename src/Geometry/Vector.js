Z.Vector = Z.Geometry.extend({
    options:{
        'symbol':{
            'line-color' : '#474cf8',
            'line-width' : 3,
            'line-opacity' : 1,

            'polygon-fill' : '#ffffff',
            'polygon-opacity' : 0
        }
    },

    _hitTestTolerance: function() {
        var symbol = this.getSymbol();
        var w = symbol['line-width'];
        return w ? w / 2 : 0;
    },

    _computeVisualExtent:function(projection) {
        var width = 0;
        var extent = this._getPrjExtent();
        if (!extent) {
            return null;
        }
        var map = this.getMap();
        var res = map._getTileConfig().getResolution(map.getZoomLevel());
        var expanded =  Z.Extent.expand(extent,res*width);
        if (!expanded) {
            return null;
        }
        return new Z.Extent(projection.unproject({x:expanded['xmin'],y:expanded['ymin']}),
                projection.unproject({x:expanded['xmax'],y:expanded['ymax']}));
    }
});
