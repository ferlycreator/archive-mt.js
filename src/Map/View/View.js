Z.View = function(options) {
    if (!options) {
        options = {};
    }
    this.options = options;
    this._initView();
}

Z.View.prototype = {
    defaultView: {
        "EPSG:3857" : {
            "resolutions" : (function() {
                    var resolutions = [];
                    for (var i = 0; i < 21; i++){
                        resolutions[i] = 2*20037508.34/(256 * Math.pow(2, i));
                    }
                    return resolutions;
                })(),
            "fullExtent": {
                "top":20037508.34,
                "left":-20037508.34,
                "bottom":-20037508.34,
                "right":20037508.34
            }
        },
        "BAIDU" : {
            "resolutions" : (function() {
                var res = Math.pow(2,18);
                var resolutions = [];
                for (var i = 0; i < 20; i++){
                    resolutions[i] = res;
                    res *= 0.5;
                }
                resolutions[0] = null;
                resolutions[1] = null;
                resolutions[2] = null;
                return resolutions;
            })(),
            "fullExtent" : {
                "top":33554432,
                "left":-33554432,
                "bottom":-33554432,
                "right":33554432
            }
        }

    },

    _initView : function() {
        var projection = this.options['projection'];
        if (projection) {
            if (Z.Util.isString(projection)) {
                for (var p in Z.Projection) {
                    if (Z.Projection.hasOwnProperty(p)) {
                        var regName = Z.Projection[p]['name'];
                        if (regName && regName.toLowerCase() === projection.toLowerCase()) {
                            projection = Z.Projection[p];
                            break;
                        }
                    }
                }
            }
        } else {
            projection = Z.Projection.DEFAULT;
        }
        if (Z.Util.isString(projection)) {
            throw new Error('must provide a valid projection in map\'s view.');
        }
        this._projection = projection;
        var resolutions = this.options['resolutions'];
        if (!resolutions) {
            resolutions = this.defaultView[projection['name']]['resolutions'];
            if (!resolutions) {
                throw new Error('must provide valid resolutions in map\'s view.');
            }
        }
        this._resolutions = resolutions;
        var fullExtent = this.options['fullExtent'];
        if (!fullExtent) {
            fullExtent = this.defaultView[projection['name']]['fullExtent'];
            if (!resolutions) {
                throw new Error('must provide a valid fullExtent in map\'s view.');
            }
        }
        this._fullExtent = fullExtent;

        var a = fullExtent['right']>fullExtent['left']?1:-1,
            b = fullExtent['top']>fullExtent['bottom']?-1:1;
        this._transformation = new Z.Transformation([a,b,0,0]);
    },

    getResolutions:function() {
        return this._resolutions;
    },

    getResolution:function(z) {
        return this._resolutions[z];
    },

    getProjection:function() {
        return this._projection;
    },

    getFullExtent:function() {
        return this._fullExtent;
    },

    getTransformation:function() {
        return this._transformation;
    },

    getMinZoom:function() {
        for (var i = 0; i < this._resolutions.length; i++) {
            if (!Z.Util.isNil(this._resolutions[i])) {
                return i;
            }
        };
    },

    getMaxZoom:function() {
        return this._resolutions.length - 1;
    }

}

