Z['Marker']=Z.Marker=Z.Geometry.extend({
    includes:[Z.Geometry.Center],

    initialize:function(center,opts) {
        this.type = Z.Geometry['TYPE_POINT'];
        this.center = new Z.Coordinate(center);
        this.initOptions(opts);
    },

    /**
     * 判断Marker是否是矢量标注
     * @return {Boolean} True|False
     * @expose
     */
    isVectorIcon:function() {
        var icon = this.getIcon();  
        if (icon) {
            return 'vector' === icon['type'];
        }
        return false;
    },

    getDefaultSymbol:function() {
        return {
            "icon":this.defaultIcon
        };
    },
    /**
     * 设置Marker的Icon
     * @param {Icon} icon 新的Icon
     * @expose
     */
    setIcon:function(icon) {
        if (!this.symbol) {
            this.symbol = {};
        }
        this.symbol['icon'] = icon;
        this.onSymbolChanged();
        return this;
    },

    /**
     * 获取Marker的Icon
     * @return {Icon} Marker的Icon
     * @expose
     */
    getIcon:function() {
        if (!this.symbol || !this.symbol['icon']) {
            return null;
        }
        return this.symbol['icon'];
    },

    computeExtent:function(projection) {
        var center = this.getCenter();
        if (!center) {return null;}
        return new Z.Extent({'x':center.x,'y':center.y},{'x':center.x,'y':center.y});
        // return {'xmin':center.x, 'ymin':center.y, 'xmax':center.x, 'ymax':center.y};
    },

    computeVisualExtent:function(projection) {
        var geo = this;
        var map = geo.getMap();
        if (!map) {
            return null;
        }
        if(!projection) {
            projection = map.getProjection();
        }
        var icon=geo.getIcon();
        if (!icon) {
            icon = geo.defaultIcon;
        }
        var center=geo.getCenter();
        var offset = icon["offset"];
        if (!offset) {
            offset = {
                'x':0,
                'y':0
            };
        }       
        if (!center) {return null;}
        var pnw,pse;
        var width, height;
        var iconType = icon['type'];
        if (iconType === "picture") {
            height = (icon["height"]?parseInt(icon["height"],10):0);
            width = (icon["width"]?parseInt(icon["width"],10):0);
            pnw = {"top":(height+offset["y"]),"left":(width/2-offset["x"])};
            pse = {"top":(-offset["y"]),"left":(width/2+offset["x"])};
        } else if (iconType === "vector") {
            var radius = icon["size"];
            if (!radius) {return null;}
            pnw = {"top":radius+offset["y"],"left":radius-offset["x"]};
            pse = {"top":radius-offset["y"],"left":radius+offset["x"]};
        } else if (iconType === "text") {
            var painter = this.getPainter();
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
        }
        var pcenter = projection.project(center);
        return map.computeExtentByPixelSize(pcenter,pnw,pse);
    },


    computeGeodesicLength:function(projection) {
        return 0;
    },

    computeGeodesicArea:function(projection) {
        return 0;
    },

    assignPainter:function() {
        if (!this.layer) {return;}
        if (this.layer instanceof Z.SVGLayer) {
            return new Z.Marker.SVG(this);
        } else if (this.layer instanceof Z.CanvasLayer) {
            return new Z.Marker.Canvas(this);
        }
    },

    exportGeoJson:function(opts) {
        var center = this.getCenter();
        return {
            'type':'Point',
            'coordinates':[center.x, center.y]
        };
    }

});