Z.Marker.PaintUtils = {

    getMarkerDomOffset: function() {
        var domOffset = this.geometry._getCenterDomOffset();
        if (!domOffset) {return null;}
        var moffset = this.getIconOffset();
        var gCenter = [(domOffset['left'] + moffset['left']), (domOffset['top'] + moffset['top'])];
        return gCenter;
    },

    getIconOffset: function() {
        var icon = this.getGeoIcon();
        var width = icon['width'];
        if (!width) {width = 0;}
        var height = icon['height'];
        if (!height) {height = 0;}
        return new Z.Point(-Math.round(width/2), -height);
    },

    getVectorArray: function(gCenter) {
        var icon = this.getGeoIcon();
        var markerType = icon['type'];
        var width = icon['width'];
        var height = icon['height'];
        var iconSize = (width + height)/2;
        var size = (0.5+iconSize) << 0;
        var radius = Math.PI/180;
        if ('triangle' === markerType) {
            var v0 = [gCenter[0],gCenter[1]-size];
            var v1 = [Z.Util.roundNumber(gCenter[0]-Math.cos(30*radius)*size),Z.Util.roundNumber(gCenter[1]+Math.sin(30*radius)*size)];
            var v2 = [Z.Util.roundNumber(gCenter[0]+Math.cos(30*radius)*size),Z.Util.roundNumber(gCenter[1]+Math.sin(30*radius)*size)];
            return [v0,v1,v2];
        }  else if ('cross' === markerType) {
            var v0 = [(gCenter[0]-size),gCenter[1]];
            var v1 = [(gCenter[0]+size),gCenter[1]];
            var v2 = [(gCenter[0]),(gCenter[1]-size)];
            var v3 = [(gCenter[0]),(gCenter[1]+size)];
            return [v0,v1,v2,v3];
        } else if ('diamond' === markerType) {
            var v0 = [(gCenter[0]-size),gCenter[1]];
            var v1 = [(gCenter[0]),(gCenter[1]-size)];
            var v2 = [(gCenter[0]+size),gCenter[1]];
            var v3 = [(gCenter[0]),(gCenter[1]+size)];
            return [v0,v1,v2,v3];
        } else if ('square' === markerType) {
            var v0 = [(gCenter[0]-size),(gCenter[1]+size)];
            var v1 = [(gCenter[0]+size),(gCenter[1]+size)];
            var v2 = [(gCenter[0]+size),(gCenter[1]-size)];
            var v3 = [(gCenter[0]-size),(gCenter[1]-size)];
            return [v0,v1,v2,v3];
        } else if ('x' === markerType || 'X' === markerType) {
            var r = Math.round(Math.cos(45*rad)*size);
            var v0 = [gCenter[0]-r,gCenter[1]+r];
            var v1 = [gCenter[0]+r,gCenter[1]-r];
            var v2 = [gCenter[0]+r,gCenter[1]+r];
            var v3 = [gCenter[0]-r,gCenter[1]-r];
            return [v0,v1,v2,v3];
        } else if ('rectangle' === markerType) {
            var v0 = [(gCenter[0]-width/2),(gCenter[1]-height/2)];
            var v1 = [(gCenter[0]+width/2),(gCenter[1]-height/2)];
            var v2 = [(gCenter[0]+width/2),(gCenter[1]+height/2)];
            var v3 = [(gCenter[0]-width/2),(gCenter[1]+height/2)];
            return [v0,v1,v2,v3];
        }
        return null;
    },

    getLabelVectorArray:function(icon) {
        var labelType = icon['shieldType'];
        if ('label' === labelType) {
            return this._getLabelPoints(icon);
        } else if ('tip' === labelType) {
            var arrowWidth = width/5;
            var arrowHeight = height/2;
            var v0 = [(gCenter[0]-width/2),(gCenter[1]-height-arrowHeight)];
            var v1 = [(gCenter[0]+width/2),(gCenter[1]-height-arrowHeight)];
            var v2 = [(gCenter[0]+width/2),(gCenter[1]-arrowHeight)];
            var v3 = [(gCenter[0]+arrowWidth/2),(gCenter[1]-arrowHeight)];
            var v4 = gCenter;
            var v5 = [(gCenter[0]-arrowWidth/2),(gCenter[1]-arrowHeight)];
            var v6 = [(gCenter[0]-width/2),(gCenter[1]-arrowHeight)];
            return [v0,v1,v2,v3,v4,v5,v6];
        }
        return null;
    },

    getTextVectorLocation: function(icon) {
        var points = this._getLabelPoints(icon);
        var leftTopPoint = points[0];
        var padding = icon['padding'];
        if(!padding) padding = 0;
        var width = icon['width'];
        var height = icon['height'];
        var align = icon['textAlign'];
        if(!align) align ='left';
        var content = icon['content'];
        var fontSize = icon['size'];
        var size = fontSize/2;
        var textWidth = Z.Util.getLength(content)*size;
        var left= leftTopPoint[0] + padding, top = leftTopPoint[1] + padding;
        if ('center' === align) {
            if(width>=textWidth) {
                left = left - (width-textWidth)/2;
            }
        } else if ('right' === align) {
            if(width>=textWidth) {
                left = left + width-textWidth;
            }
        }
        return [left, top];
    },

    _getLabelPoints: function(icon) {
        var gCenter = this.geometry._getCenterDomOffset();
        if (!gCenter) {return null;}
        var left = gCenter['left'];
        var top = gCenter['top'];
        var height = icon['height'];
        var width = icon['width'];
        var content = icon['content'];
        var fontSize = icon['size'];
        var size = fontSize/2;
        var lineSpacing = icon['lineSpacing'];
        var textWidth = Z.Util.getLength(content)*size;
        var rowNum = 0;
        if(textWidth>width){
            rowNum = Math.ceil(textWidth/width);
        }
        height += rowNum*((fontSize+lineSpacing)/2);
        width += fontSize;
        var points = [];
        var point0,point1,point2,point3;
        var horizontal = icon['horizontal'];//水平
        if(!horizontal) horizontal = 'middle';
        var vertical = icon['vertical'];//垂直
        if(!vertical) vertical = 'middle';
        if ('left' === horizontal) {
            if('top' === vertical) {
                point0 = [(left-width),(top-height)];
                point1 = [(left),(top-height)];
                point2 = [left, top];
                point3 = [(left-width),(top)];
            } else if ('middle' === vertical) {
                point0 = [(left-width),(top-height/2)];
                point1 = [(left),(top-height/2)];
                point2 = [(left),(top+height/2)];
                point3 = [(left-width),(top+height/2)];
            } else if ('bottom' === vertical) {
                point0 = [(left-width),(top)];
                point1 = [left, top];
                point2 = [(left),(top+height)];
                point3 = [(left-width),(top+height)];
            }
        } else if ('middle' === horizontal) {
            if('top' === vertical) {
                point0 = [(left-width/2),(top-height)];
                point1 = [(left+width/2),(top-height)];
                point2 = [(left+width/2),(top)];
                point3 = [(left-width/2),(top)];
            } else if ('middle' === vertical) {
                point0 = [(left-width/2),(top-height/2)];
                point1 = [(left+width/2),(top-height/2)];
                point2 = [(left+width/2),(top+height/2)];
                point3 = [(left-width/2),(top+height/2)];
            } else if ('bottom' === vertical) {
                point0 = [(left-width/2),(top)];
                point1 = [(left+width/2),(top)];
                point2 = [(left+width/2),(top+height)];
                point3 = [(left-width/2),(top+height)];
            }
        } else if ('right' === horizontal) {
            if('top' === vertical) {
                point0 = [(left),(top-height)];
                point1 = [(left+width),(top-height)];
                point2 = [(left+width),(top)];
                point3 = [left, top];
            } else if ('middle' === vertical) {
                point0 = [(left),(top-height/2)];
                point1 = [(left+width),(top-height/2)];
                point2 = [(left+width),(top+height/2)];
                point3 = [(left),(top+height/2)];
            } else if ('bottom' === vertical) {
                point0 = [left, top];
                point1 = [(left+width),(top)];
                point2 = [(left+width),(top+height)];
                point3 = [(left),(top+height)];
            }
        }
        points = [point0, point1, point2, point3];
        return points;
    },

    computeLabelOffset: function(width, height, option) {
        var left = -width/2;
        var top = height/2;
        if (option) {
            var placement = option['placement'];
            if('left' === placement) {
                left = -width;
            } else if('right' === placement) {
                left = 0;
            } else if('top' === placement) {
                top = height;
            } else if('bottom' === placement) {
                top = 0;
            }
        }
        return new Z.Point(left, top);
    },

    getGeoIcon: function() {
        if (this.iconSymbol)  {
            return this.iconSymbol;
        }
        if (this.shieldSymbol)  {
            return this.shieldSymbol;
        }
        if (this.geometry) {
            return this.geometry.getSymbol();
        }
    }
};