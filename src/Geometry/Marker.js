Z['Marker']=Z.Marker=Z.Geometry.extend({
    includes:[Z.Geometry.Center],

    type: Z.Geometry['TYPE_POINT'],

    options:{
        'symbol':{
            'markerType' : 'circle',
            'markerLineColor': '#ff0000',
            'markerFill': '#ffffff',
            'markerFillOpacity': 0.6,
            'markerHeight' : 8,
            'markerWidth' : 8
        }
    },

    initialize:function(coordinates,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this._initOptions(opts);
    },

    _containsPoint: function(point) {
        var symbol = this.getSymbol();
        var markerSize = this._getMarkerSize(symbol);
        var width = markerSize.width,
            height = markerSize.height,
            x = Z.Util.setDefaultValue(symbol.dx, 0)+
                Z.Util.setDefaultValue(symbol.textDx, 0),
            y = Z.Util.setDefaultValue(symbol.dy, 0)+
                Z.Util.setDefaultValue(symbol.textDy, 0),
            center = this._getCenterDomOffset();
        var mapOffset = this.getMap().offsetPlatform();

        var left = center['left']+mapOffset['left'] + x;
        var top = center['top']+mapOffset['top'] + y;

        var pxMin = new Z.Point(left - width/2, top - height),
            pxMax = new Z.Point(left + width/2, top);

        var vertical, horizontal, px;
        if (symbol['markerType']) {
            pxMin = new Z.Point(left - width/2, top - height/2);
            pxMax = new Z.Point(left + width/2, top + height/2);
        } else if (symbol['shieldType']) {
            vertical = Z.Util.setDefaultValue(symbol['shieldVerticalAlignment'], 'middle');
            horizontal = Z.Util.setDefaultValue(symbol['shieldHorizontalAlignment'], 'middle');
            px = this._getExtent(left, top, vertical, horizontal, width, height);
            pxMin = px['min'];
            pxMax = px['max'];
        } else if (symbol['textName']) {
            vertical = Z.Util.setDefaultValue(symbol['textVerticalAlignment'], 'middle');
            horizontal = Z.Util.setDefaultValue(symbol['textHorizontalAlignment'], 'middle');
            px = this._getExtent(left, top, vertical, horizontal, width, height);
            pxMin = px['min'];
            pxMax = px['max'];
        }
        var pxExtent = new Z.Extent(pxMin.left, pxMin.top, pxMax.left, pxMax.top);
        return pxExtent.contains(point);
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
            var shieldName = Z.Util.setDefaultValue(symbol['shieldName'], '');
            content = this._convertContent(shieldName);

        } else if (symbol['textName']) {
                fontSize = Z.Util.setDefaultValue(symbol['textSize'], 12);
                lineSpacing = Z.Util.setDefaultValue(symbol['textLineSpacing'], 12);
                var textName = Z.Util.setDefaultValue(symbol['textName'], '');
                var textWidth = Z.Util.setDefaultValue(symbol['textWrapWidth'], 0);
                width = (width>textWidth)?width:textWidth;
                var textHeight = fontSize;
                height = (height>textHeight)?height:textHeight;
                content = this._convertContent(textName);
        }
        return this._getRealSize(height, width, content, fontSize, lineSpacing);
    },

     _convertContent: function(content) {
        var props = this.getProperties();
        if(content&&content.length>0) {
            var regex = /\[.*\]/gi;
            if(regex.test(content)) {
                var arr = content.match(regex);
                if(arr&&arr.length>0) {
                    var key = arr[0].substring(1,arr[0].length-1);
                    if(props) {
                        if(props[key]) {
                            content = content.replace(regex, props[key]);
                        }
                    }
                }
            }
        }
        return content;
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

    _getExtent: function(left, top, vertical, horizontal, width, height) {
        var min, max;
        if ('left' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left-width), 'top': (top-height)};
                max = {'left': (left), 'top': (top)};
            } else if ('middle' === vertical) {
                min = {'left': (left-width), 'top': (top-height/2)};
                max = {'left': (left), 'top': (top+height/2)};
            } else if ('bottom' === vertical) {
                min = {'left': (left-width), 'top': (top)};
                max = {'left': (left), 'top': (top+height)};
            }
        } else if ('middle' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left-width/2), 'top': (top-height)};
                max = {'left': (left+width/2), 'top': (top)};
            } else if ('middle' === vertical) {
                min = {'left': (left-width/2), 'top': (top-height/2)};
                max = {'left': (left+width/2), 'top': (top+height/2)};
            } else if ('bottom' === vertical) {
                min = {'left': (left-width/2), 'top': (top)};
                max = {'left': (left+width/2), 'top': (top+height)};
            }
        } else if ('right' === horizontal) {
            if('top' === vertical) {
                min = {'left': (left), 'top': (top-height)};
                max = {'left': (left+width),  'top': (top)};
            } else if ('middle' === vertical) {
                min = {'left': (left), 'top': (top-height/2)};
                max = {'left': (left+width), 'top': (top+height/2)};
            } else if ('bottom' === vertical) {
                min = {'left': (left), 'top': (top)};
                max = {'left': (left+width), 'top': (top+height)};
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
        var pnw,pse;
        var width, height;
        var size = this._getMarkerSize(icon);
        width = size.width;
        height = size.height;
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
