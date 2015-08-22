Z.Vector = Z.Geometry.extend({
    options:{
        'symbol':{
            'stroke' : '#ff0000',
            'strokeWidth' : 3,
            'strokeOpacity' : 1,
            'strokeDasharray': '-',
            'fill' : '#ffffff',
            'fillOpacity' : 1
        }
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
    	}    	*/
        var extent = this._getPrjExtent();
        var map = this.getMap();
        var res = map._getLodConfig().getResolution(map.getZoomLevel());
        var expanded =  Z.Extent.expand(extent,res*width);
        if (!expanded) {
            return null;
        }
        return new Z.Extent(projection.unproject({x:expanded['xmin'],y:expanded['ymin']}),projection.unproject({x:expanded['xmax'],y:expanded['ymax']}));
    }
});