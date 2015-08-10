Z['MultiPolygon'] = Z.MultiPolygon = Z.MultiPoly.extend({
    GeometryType:Z.Polygon,    

    exportGeoJson:function(opts) {        
        var points = this.getCoordinates();
        return {
            'type':'MultiPolygon',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }
});