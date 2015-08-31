Z['Marker']=Z.Marker=Z.Geometry.extend({
    includes:[Z.Geometry.Center],

    type: Z.Geometry['TYPE_POINT'],

    options:{
        'symbol':{
            markerFile : Z.host + '/engine/images/marker.png',
            markerHeight : 30,
            markerWidth : 22,
            dx : 0,
            dy : 0
        }
    },

    initialize:function(coordinates,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this._initOptions(opts);
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
        return this.setSymbol(icon);
    },

    setText: function(text) {
        this._setIcon(text);
    },

    _containsPoint: function(point) {
        var symbol = this.getSymbol();
        var markerSize = this._getMarkerSize(symbol);
        var width = markerSize.width,
            height = markerSize.height,
            x = symbol.dx,
            y = symbol.dy,
            center = this._getCenterDomOffset();
        var pxMin = new Z.Point(center.left - width/2 + x, center.top - height - y),
            pxMax = new Z.Point(center.left + width/2 + x, center.top - y);

        if (symbol['markerType']) {
            pxMin = new Z.Point(center.left - width/2 + x, center.top - height/2 - y);
            pxMax = new Z.Point(center.left + width/2 + x, center.top + height/2 - y);
        } else if (symbol['shieldType']) {
            var vertical = Z.Util.setDefaultValue(symbol['shieldVerticalAlignment'], 'middle'),
                horizontal = Z.Util.setDefaultValue(symbol['shieldHorizontalAlignment'], 'middle');
            var px = this._getExtent(center, vertical, horizontal, width, height, x, y);
            pxMin = px['min'];
            pxMax = px['max'];
        } else if (symbol['textName']) {
            var vertical = Z.Util.setDefaultValue(symbol['textVerticalAlignment'], 'middle'),
                horizontal = Z.Util.setDefaultValue(symbol['textHorizontalAlignment'], 'middle');
            var px = this._getExtent(center, vertical, horizontal, width, height, x, y);
            pxMin = px['min'];
            pxMax = px['max'];
        }
        var pxExtent = new Z.Extent(pxMin.left, pxMin.top, pxMax.left, pxMax.top);
        return pxExtent.contains(pxExtent, point);
    },

    _getMarkerSize: function(symbol) {
        var width=0,height=0;
        var fontSize=0,lineSpacing=0,content='';
        if (symbol['markerType']) {
            width = Z.Util.setDefaultValue(symbol['markerWidth'], 0);
            height = Z.Util.setDefaultValue(symbol['markerHeight'], 0);
            if(width > height) {
                height = width;
            } else {
                width = height;
            }
        } else if (symbol['shieldType']) {
            width = Z.Util.setDefaultValue(symbol['shieldWrapWidth'], 0);
            height = Z.Util.setDefaultValue(symbol['shieldSize'], 0) +
                     Z.Util.setDefaultValue(symbol['shieldLineSpacing'], 0);
            fontSize = Z.Util.setDefaultValue(symbol['shieldSize'], 12);
            lineSpacing = Z.Util.setDefaultValue(symbol['shieldLineSpacing'], 12);
            shieldName = Z.Util.setDefaultValue(symbol['shieldName'], '');

        } else if (symbol['textName']) {
                fontSize = Z.Util.setDefaultValue(symbol['textSize'], 12);
                lineSpacing = Z.Util.setDefaultValue(symbol['textLineSpacing'], 12);
                textName = Z.Util.setDefaultValue(symbol['textName'], '');
                var textWidth = Z.Util.setDefaultValue(symbol['textWrapWidth'], 0);
                width = (width>textWidth)?width:textWidth;
                var textHeight = fontSize;
                height = (height>textHeight)?height:textHeight;
        }
        return this._getRealSize(height, width, content, fontSize, lineSpacing);
    },

    _getRealSize: function(height, width, content, fontSize, lineSpacing) {
        if (content&&content.length>0) {
            var fontSize = icon['size'];
            var size = fontSize/2;
            var textWidth = Z.Util.getLength(content)*size;
            var rowNum = 0;
            if(textWidth>width){
                rowNum = Math.ceil(textWidth/width);
            }
            height += rowNum*((fontSize+lineSpacing)/2);
            width += fontSize;
        }
        return {'width': width, 'height': height};
    },

    _getExtent: function(center, vertical, horizontal, width, height, x, y) {
        var left = center.left;
        var top = center.top;
        var min, max;
        if ('left' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left-width+x), 'top': (top-height-y)};
                max = {'left': (left+x), 'top': (top-y)};
            } else if ('middle' === vertical) {
                min = {'left': (left-width+x), 'top': (top-height/2-y)};
                max = {'left': (left+x), 'top': (top+height/2-y)};
            } else if ('bottom' === vertical) {
                min = {'left': (left-width+x), 'top': (top-y)};
                max = {'left': (left+x), 'top': (top+height-y)};
            }
        } else if ('middle' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left-width/2+x), 'top': (top-height-y)};
                max = {'left': (left+width/2+x), 'top': (top-y)};
            } else if ('middle' === vertical) {
                min = {'left': (left-width/2+x), 'top': (top-height/2-y)};
                max = {'left': (left+width/2+x), 'top': (top+height/2-y)};
            } else if ('bottom' === vertical) {
                min = {'left': (left-width/2+x), 'top': (top-y)};
                max = {'left': (left+width/2+x), 'top': (top+height-y)};
            }
        } else if ('right' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left+x), 'top': (top-height-y)};
                max = {'left': (left+width+x),  'top': (top-y)};
            } else if ('middle' === vertical) {
                min = {'left': (left+x), 'top': (top-height/2-y)};
                max = {'left': (left+width+x), 'top': (top+height/2-y)};
            } else if ('bottom' === vertical) {
                min = {'left': (left+x), 'top': (top-y)};
                max = {'left': (left+width+x), 'top': (top+height-y)};
            }
        }
        return {'min': min, 'max': max};
    },

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
        pnw = new Z.Point((width/2-offset['x']), (height+offset['y']));
        pse = new Z.Point((width/2+offset['x']), (-offset['y']));

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
        if (!this.layer) {return null;}
        if (this.layer.isCanvasRender()) {
            return new Z.Marker.Canvas(this);
        } else {
            return new Z.Marker.SVG(this);
        }
        return null;
    }
});
