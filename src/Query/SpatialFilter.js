Z['SpatialFilter']=Z.SpatialFilter=Z.Class.extend({
    statics: {
        'RELATION_INTERSECT' : 0,
        'RELATION_CONTAIN' : 1,
        'RELATION_DISJOINT' : 2,
        'RELATION_OVERLAP' : 3,
        'RELATION_TOUCH' : 4,
        'RELATION_WITHIN' : 5,
        'RELATION_CONTAINCENTER' : 7
    },

    initialize:function(geometry, relation) {
        this.geometry = geometry;
        this.relation = relation;
    },
    /**
     * 获取SpatialFilter中的geometry
     * @return {Geometry} SpatialFilter的Geometry
     * @export
     */
    getGeometry: function() {
        return this.geometry;
    },

    /**
     * 获取SpatialFilter的json
     * @return {String} spatialfilter
     * @export
     */
    toJson: function() {
        var jsonObj = {
          "geometry": this.geometry.toJson(),
          "relation": this.relation
        };
        return jsonObj;
    }

});