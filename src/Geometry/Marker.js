Z['Marker']=Z.Marker=Z.Geometry.extend({
    includes:[Z.Geometry.Center],

    type: Z.Geometry['TYPE_POINT'],

    options:{
        //TODO 应该更新为cartoCSS风格的icon
        'symbol':{
            'url' : Z.host + '/engine/images/marker.png',
            'height' : 30,
            'width' : 22,
            'offset' : {
                'x' : 0,
                'y' : 0
            }
        }
    },

    initialize:function(coordinates,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this.initOptions(opts);
    },

    getDefaultSymbol:function() {
        return {
            'icon': this.defaultIcon
        };
    },

    /**
     * 设置Marker的Icon
     * @param {Icon} icon 新的Icon
     * @expose
     */
    _setIcon: function(icon) {
        /*if (!this.symbol) {
            this.symbol = {};
        }
        //属性的变量名转化为驼峰风格
        var camelSymbol = Z.Util.convertFieldNameStyle(icon,'camel');
        this.symbol = camelSymbol;
        this._onSymbolChanged();
        return this;*/
        return this.setSymbol(icon);
    },

    setText: function(text) {
        this._setIcon(text);
    },

    /**
     * 获取Marker的Icon
     * @return {Icon} Marker的Icon
     * @expose
     */
    /*getIcon:function() {
        if (!this.symbol || !this.symbol['icon']) {
            return null;
        }
        return this.symbol['icon'];
    },*/

    _computeExtent:function(projection) {
        var coordinates = this.getCenter();
        if (!coordinates) {return null;}
        return new Z.Extent({'x':coordinates.x,'y':coordinates.y},{'x':coordinates.x,'y':coordinates.y});
    },

    _computeVisualExtent:function(projection) {
        var geo = this;
        var map = geo.getMap();
        if (!map) {
            return null;
        }
        if(!projection) {
            projection = map._getProjection();
        }
        var icon=geo.getSymbol();

        var coordinates=geo.getCenter();
        var offset = icon['offset'];
        if (!offset) {
            offset = {
                'x':0,
                'y':0
            };
        }
        if (!coordinates) {return null;}
        var pnw,pse;
        var width, height;
        var iconType = icon['type'];
        height = (icon['height']?parseInt(icon['height'],10):0);
        width = (icon['width']?parseInt(icon['width'],10):0);
        pnw = {'top':(height+offset['y']), 'left':(width/2-offset['x'])};
        pse = {'top':(-offset['y']), 'left':(width/2+offset['x'])};

        /**if (iconType === "picture") {
            height = (icon['height']?parseInt(icon['height'],10):0);
            width = (icon['width']?parseInt(icon['width'],10):0);
            pnw = {'top':(height+offset['y']), 'left':(width/2-offset['x'])};
            pse = {'top':(-offset['y']), 'left':(width/2+offset['x'])};
        } else if (iconType === "vector") {
            var radius = icon["size"];
            if (!radius) {return null;}
            pnw = {"top":radius+offset["y"],"left":radius-offset["x"]};
            pse = {"top":radius-offset["y"],"left":radius+offset["x"]};
        } else if (iconType === "text") {
            var painter = this._getPainter();
            var textSize = painter.measureTextMarker();
            if (!textSize) {
                pnw={"top":0,"left":0};
                pse={"top":0,"left":0};
            } else {
                var padding = 0;
                try {
                    padding = icon["textStyle"]["padding"];
                }catch (error) {}
                if (!padding) {padding = 0;}
                pnw = {"top":(textSize["offset"].y),"left":(-textSize["offset"].x)};
                pse = {"top":(textSize["height"]-textSize["offset"].y+2*padding),"left":(textSize["width"]+textSize["offset"].x+2*padding)};
            }

        } else {
            icon = geo.defaultIcon;
            height = geo.defaultIcon['height'];
            width = geo.defaultIcon['width'];
            pnw = {"top":(height+offset["y"]),"left":(width/2-offset["x"])};
            pse = {"top":(-offset["y"]),"left":(width/2+offset["x"])};
        }*/

        var pcenter = projection.project(coordinates);
        return map._computeExtentByPixelSize(pcenter, pnw, pse);
    },


    _computeGeodesicLength:function(projection) {
        return 0;
    },

    _computeGeodesicArea:function(projection) {
        return 0;
    },

    _assignPainter:function() {
        if (!this.layer) {return;}
        if (this.layer instanceof Z.SVGLayer) {
            return new Z.Marker.SVG(this);
        } else if (this.layer instanceof Z.CanvasLayer) {
            return new Z.Marker.Canvas(this);
        }
    }
});