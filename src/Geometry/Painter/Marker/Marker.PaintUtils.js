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
        return new Z.Point(-Math.round(width/2),-height);
    },

    getVectorArray: function(gCenter) {
        var icon = this.getGeoIcon();
        var markerType = icon['type'];
        var width = Z.Util.setDefaultValue(icon['width'],0);
        var height = Z.Util.setDefaultValue(icon['height'],0);
        var iconSize = 0;
        if(width>height){
            iconSize = width;
        } else {
            iconSize = height;
        }
        var size = iconSize/2;
        var dx = Z.Util.setDefaultValue(icon['dx'],0);
        var dy = Z.Util.setDefaultValue(icon['dy'],0);
        var left = gCenter[0] + dx;
        var top = gCenter[1] + dy;
        var radius = Math.PI/180;
        if ('circle' === markerType) {
            var v0 = [left,top];
            return [v0];
        } else if ('triangle' === markerType) {
            var v0 = [left,top-size];
            var v1 = [Z.Util.roundNumber(left-Math.cos(30*radius)*size),Z.Util.roundNumber(top+Math.sin(30*radius)*size)];
            var v2 = [Z.Util.roundNumber(left+Math.cos(30*radius)*size),Z.Util.roundNumber(top+Math.sin(30*radius)*size)];
            return [v0,v1,v2];
        }  else if ('cross' === markerType) {
            var v0 = [(left-size),top];
            var v1 = [(left+size),top];
            var v2 = [(left),(top-size)];
            var v3 = [(left),(top+size)];
            return [v0,v1,v2,v3];
        } else if ('diamond' === markerType) {
            var v0 = [(left-size),top];
            var v1 = [(left),(top-size)];
            var v2 = [(left+size),top];
            var v3 = [(left),(top+size)];
            return [v0,v1,v2,v3];
        } else if ('square' === markerType) {
            var v0 = [(left-size),(top+size)];
            var v1 = [(left+size),(top+size)];
            var v2 = [(left+size),(top-size)];
            var v3 = [(left-size),(top-size)];
            return [v0,v1,v2,v3];
        } else if ('x' === markerType || 'X' === markerType) {
            var r = Math.round(Math.cos(45*radius)*size);
            var v0 = [left-r,top+r];
            var v1 = [left+r,top-r];
            var v2 = [left+r,top+r];
            var v3 = [left-r,top-r];
            return [v0,v1,v2,v3];
        } else if ('bar' === markerType) {
            var v0 = [(left-width/2),(top-height)];
            var v1 = [(left+width/2),(top-height)];
            var v2 = [(left+width/2),(top)];
            var v3 = [(left-width/2),(top)];
            return [v0,v1,v2,v3];
        }
        return null;
    },

    getLabelVectorArray:function(icon) {
        var labelType = icon['shieldType'];
        if ('label' === labelType) {
            return this._getLabelPoints(icon);
        } else if ('tip' === labelType) {
            return this._getTipPoints(icon);
        }
        return null;
    },

    getTextVectorLocation: function(icon) {
        var points = this._getLabelPoints(icon);
        var labelType = icon['shieldType'];
        if ('label' === labelType) {
            points = this._getLabelPoints(icon);
        } else if ('tip' === labelType) {
            points = this._getTipPoints(icon);
        }
        var leftTopPoint = points[0];

        //var padding = icon['padding'];
        var width = icon['width'];
        var height = icon['height'];
        if(!icon['shieldType']) {
            width = Z.Util.setDefaultValue(icon['textWidth'],0);
            height = Z.Util.setDefaultValue(icon['size'], 12);
        }
        //if(!padding) padding = 0;
        var align = icon['textAlign'];
        if(!align) align ='left';
        var content = icon['content'];
        var fontSize = icon['size'];
        var size = fontSize/2;
        var textWidth = Z.Util.getLength(content)*size;
        var left= leftTopPoint[0], top = leftTopPoint[1];
        if ('center' === align) {
            if(width>=textWidth) {
                left = left - width-textWidth;
            }
        } else if ('right' === align) {
            if(width>=textWidth) {
                left = left + width-textWidth;
            }
        }
        var textDx = Z.Util.setDefaultValue(icon['textDx'],0);
        var textDy = Z.Util.setDefaultValue(icon['textDy'],0);
        return [left+textDx, top+textDy];
    },

    _getLabelPoints: function(icon) {
        var gCenter = this.geometry._getCenterDomOffset();
        if (!gCenter) {return null;}
        var mapOffset = this.geometry.getMap().offsetPlatform();
        var dx = Z.Util.setDefaultValue(icon['dx'],0);
        var dy = Z.Util.setDefaultValue(icon['dy'],0);
        var left = gCenter['left']+mapOffset['left'] + dx;
        var top = gCenter['top']+mapOffset['top'] + dy;

        var height = icon['height'];
        var width = icon['width'];
        if(!icon['shieldType']) {
            width = Z.Util.setDefaultValue(icon['textWidth'],0);
            height = Z.Util.setDefaultValue(icon['size'], 12);
        }
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

     _getTipPoints: function(icon) {
        var gCenter = this.geometry._getCenterDomOffset();
        if (!gCenter) {return null;}
        var mapOffset = this.geometry.getMap().offsetPlatform();
        var dx = Z.Util.setDefaultValue(icon['dx'],0);
        var dy = Z.Util.setDefaultValue(icon['dy'],0);
        var left = gCenter['left']+mapOffset['left'] + dx;
        var top = gCenter['top']+mapOffset['top'] + dy;

        var height = icon['height'];
        var width = icon['width'];
        if(!icon['shieldType']) {
            width = Z.Util.setDefaultValue(icon['textWidth'],0);
            height = Z.Util.setDefaultValue(icon['size'], 12);
        }
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
        var point0,point1,point2,point3,point4,point5,point6;
        var horizontal = icon['horizontal'];//水平
        if(!horizontal) horizontal = 'middle';
        var vertical = icon['vertical'];//垂直
        if(!vertical) vertical = 'top';
        if ('left' === horizontal) {
            var arrowWidth = arrowHeight = height/2;
            if('top' === vertical) {
                point0 = [(left-width-arrowWidth),(top-height)];
                point1 = [(left-arrowWidth),(top-height)];
                point2 = [(left-arrowWidth),(top-arrowHeight)];
                point3 = [left, top];
                point4 = [left, top];
                point5 = [left, top];
                point6 = [(left-width-arrowWidth),(top)];
            } else if ('middle' === vertical) {
                point0 = [(left-width-arrowWidth),(top-height/2)];
                point1 = [(left-arrowWidth),(top-height/2)];
                point2 = [(left-arrowWidth),(top-arrowHeight/2)];
                point3 = [left, top];
                point4 = [(left-arrowWidth),(top+arrowHeight/2)];
                point5 = [(left-arrowWidth),(top+height/2)];
                point6 = [(left-width-arrowWidth),(top+height/2)];
            } else if ('bottom' === vertical) {
                point0 = [(left-width-arrowWidth),(top)];
                point1 = [left, top];
                point2 = [left, top];
                point3 = [left, top];
                point4 = [(left-arrowWidth),(top+arrowHeight)];
                point5 = [(left-arrowWidth),(top+height)];
                point6 = [(left-width-arrowWidth),(top+height)];
            }
        } else if ('middle' === horizontal) {
            var arrowWidth = Math.round(width/5);
            var arrowHeight = Math.round(height/2);
            if('top' === vertical
            || 'middle' === vertical) {
                point0 = [(left-Math.round(width/2)),(top-height-arrowHeight)];
                point1 = [(left+Math.round(width/2)),(top-height-arrowHeight)];
                point2 = [(left+Math.round(width/2)),(top-arrowHeight)];
                point3 = [(left+Math.round(arrowWidth/2)),(top-arrowHeight)];
                point4 = [left, top];
                point5 = [(left-Math.round(arrowWidth/2)),(top-arrowHeight)];
                point6 = [(left-Math.round(width/2)),(top-arrowHeight)];
            } else if ('bottom' === vertical) {
                point0 = [(left-Math.round(width/2)),(top+arrowHeight)];
                point1 = [(left-Math.round(arrowWidth/2)),(top+arrowHeight)];
                point2 = [left, top];
                point3 = [(left+Math.round(arrowWidth/2)),(top+arrowHeight)];
                point4 = [(left+Math.round(width/2)),(top+arrowHeight)];
                point5 = [(left+Math.round(width/2)),(top+height+arrowHeight)];
                point6 = [(left-Math.round(width/2)),(top+height+arrowHeight)];
            }
        } else if ('right' === horizontal) {
            var arrowWidth = arrowHeight = height/2;
            if('top' === vertical) {
                point0 = [(left+arrowWidth),(top-height)];
                point1 = [(left+width+arrowWidth),(top-height)];
                point2 = [(left+width+arrowWidth),(top)];
                point3 = [(left+arrowWidth), top];
                point4 = [left, top];
                point5 = [left, top];
                point6 = [(left+arrowWidth),(top-arrowHeight)];
            } else if ('middle' === vertical) {
                point0 = [left+arrowWidth, (top-height/2)];
                point1 = [(left+width+arrowWidth),(top-height/2)];
                point2 = [(left+width+arrowWidth),(top+height/2)];
                point3 = [(left+arrowWidth),(top+height/2)];
                point4 = [(left+arrowWidth),(top+arrowHeight/2)];
                point5 = [left, top];
                point6 = [(left+arrowWidth),(top-arrowHeight/2)];
            } else if ('bottom' === vertical) {
                point0 = [left+arrowWidth, top];
                point1 = [(left+width+arrowWidth),(top)];
                point2 = [(left+width+arrowWidth),(top+height)];
                point3 = [(left+arrowWidth),(top+height)];
                point4 = [(left+arrowWidth),(top+arrowHeight)];
                point5 = [left, top];
                point6 = [left, top];
            }
        }
        points = [point0, point1, point2, point3, point4, point5, point6];
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