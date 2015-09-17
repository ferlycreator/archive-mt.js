/**
 * 空间过滤类
 * @class maptalks.SpatialFilter
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z['SpatialFilter']=Z.SpatialFilter=Z.Class.extend({

    statics: {
        /**
         * @static
         * @property {Number} RELATION_INTERSECT 相交
         */
        'RELATION_INTERSECT' : 0,
        /**
         * @static
         * @property {Number} RELATION_CONTAIN 包含
         */
        'RELATION_CONTAIN' : 1,
        /**
         * @static
         * @property {Number} RELATION_DISJOINT 分离
         */
        'RELATION_DISJOINT' : 2,
        /**
         * @static
         * @property {Number} RELATION_OVERLAP 重叠
         */
        'RELATION_OVERLAP' : 3,
        /**
         * @static
         * @property {Number} RELATION_TOUCH 接触
         */
        'RELATION_TOUCH' : 4,
        /**
         * @static
         * @property {Number} RELATION_WITHIN 在内部
         */
        'RELATION_WITHIN' : 5,
        /**
         * @static
         * @property {Number} RELATION_CONTAINCENTER 包含中心点
         */
        'RELATION_CONTAINCENTER' : 7
    },

    /**
     * @constructor
     * @param {maptalks.Geometry} geometry
     * @param {Number} relation
     */
    initialize:function(geometry, relation) {
        this.geometry = geometry;
        this.relation = relation;
    },

    /**
     * 获取SpatialFilter中的geometry
     * @return {maptalks.Geometry} SpatialFilter的Geometry
     * @expose
     */
    getGeometry: function() {
        return this.geometry;
    },

    /**
     * 获取SpatialFilter的json
     * @return {String} spatialfilter
     * @expose
     */
    toJson: function() {
        var jsonObj = {
          "geometry": this.geometry.toJson(),
          "relation": this.relation
        };
        return jsonObj;
    }

});