Z['MultiPoint'] = Z.MultiPoint = Z.MultiPoly.extend({
    GeometryType:Z.Marker,    

    exportGeoJson:function(opts) {   
        var points = this.getCoordinates();
        return {
            'type':'MultiPoint',
            'coordinates':this.toGeoJsonCoordinates(points)
        };
    }
});