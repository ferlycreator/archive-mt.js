Z['MultiPolyline']=Z.MultiPolyline = Z.MultiPoly.extend({
    GeometryType:Z.Polyline,    

    exportGeoJson:function(opts) {        
        var points = this.getCoordinates();
        return {
            'type':'MultiLineString',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }
});