/**
 * [initialize description]
 *
 */
Z['ArcgisTileLayer'] = Z.ArcgisTileLayer = Z.TileLayer.extend({
    options:{
        arcgisService:'',
        version:'10.2'
    },

    initialize:function(id, options) {
        Z.Util.setOptions(this, options);
    },

    getLodConfig:function() {

    },

    load:function() {

    }
});