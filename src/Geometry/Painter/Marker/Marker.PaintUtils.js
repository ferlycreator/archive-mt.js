Z.Marker.PaintUtils = {

    getMarkerDomOffset:function() {
        var domOffset = this.geometry.getCenterDomOffset();
        if (!domOffset) {return null;}
        var moffset = this.getIconOffset();
        var gCenter = [(domOffset["left"] + moffset["left"]), (domOffset["top"] + moffset["top"])];
        return gCenter;
    },

    getIconOffset : function() {
        var icon = this.getGeoIcon();
        if (!icon['offset']) {
            icon['offset'] = {
                x:0,
                y:0
            };
        }
        if ('picture' !== icon['type']) {
            return {
                'top' : icon['offset']['y'],
                'left' : icon['offset']['x']
            };
        }
        var w = icon['width'];
        if (!w) {w=0;}
        var h = icon['height'];
        if (!h) {h=0;}
        return {
            'top' : (-h - icon['offset']['y']),
            'left' : (-Math.round(w / 2) + icon['offset']['x'])
        };
    },

    getVectorArray:function(gCenter) {  
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
            var v0 = [(gCenter[0]-width/2),(gCenter[1]+height/2)];
            var v1 = [(gCenter[0]+width/2),(gCenter[1]+height/2)];
            var v2 = [(gCenter[0]+width/2),(gCenter[1]-height/2)];
            var v3 = [(gCenter[0]-width/2),(gCenter[1]-height/2)];
            return [v0,v1,v2,v3];
        } else if ('tip' === markerType) {
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
        return {'x':left, 'y':top};
    },

    getGeoIcon: function() {
        if (this.iconSymbol)  {
            return this.iconSymbol;
        }
        if (this.geometry) {
            return this.geometry.getIcon();
        }
    }
};