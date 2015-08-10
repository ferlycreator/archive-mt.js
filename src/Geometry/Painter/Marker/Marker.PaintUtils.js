Z.Marker.PaintUtils = {

    getMarkerDomOffset:function() {
        var domOffset = this.geometry.getCenterDomOffset();
        if (!domOffset) {return null;}
        var moffset = this.getIconOffset();
        var gCenter = [(domOffset["left"] + moffset["left"]),(domOffset["top"] + moffset["top"])];
        return gCenter;
    },

    getIconOffset : function() {
        var icon = this.getGeoIcon();
        if (!icon["offset"]) {
            icon["offset"] = {
                    x:0,
                    y:0
            };
        }
        if ("picture" !== icon["type"]) {
            return {
                "top" : icon["offset"]["y"],
                "left" : icon["offset"]["x"]
            };
        }
        var w = icon["width"];
        if (!w) {w=0;}
        var h = icon["height"];
        if (!h) {h=0;}
        return {
            "top" : (-h - icon["offset"]["y"]),
            "left" : (-Math.round(w / 2) + icon["offset"]["x"])
        };
    },

    getVectorArray:function(gCenter) {  
        var icon = this.getGeoIcon();
        var vType = icon["style"];
        var size = (0.5+icon["size"]) << 0;
        var rad = Math.PI/180;
        if ("triangle" === vType) {
            var v0 = [gCenter[0],gCenter[1]-size];
            var v1 = [Z.Util.roundNumber(gCenter[0]-Math.cos(30*rad)*size),Z.Util.roundNumber(gCenter[1]+Math.sin(30*rad)*size)];
            var v2 = [Z.Util.roundNumber(gCenter[0]+Math.cos(30*rad)*size),Z.Util.roundNumber(gCenter[1]+Math.sin(30*rad)*size)];
            return [v0,v1,v2];
        }  else if ("cross" === vType) {
            var v0 = [(gCenter[0]-size),gCenter[1]];
            var v1 = [(gCenter[0]+size),gCenter[1]];
            var v2 = [(gCenter[0]),(gCenter[1]-size)];
            var v3 = [(gCenter[0]),(gCenter[1]+size)];
            return [v0,v1,v2,v3];
        } else if ("diamond" === vType) {
            var v0 = [(gCenter[0]-size),gCenter[1]];
            var v1 = [(gCenter[0]),(gCenter[1]-size)];
            var v2 = [(gCenter[0]+size),gCenter[1]];
            var v3 = [(gCenter[0]),(gCenter[1]+size)];
            /*_graphicDom = {
                    "type" : "path",                    
                    "path" : "M"+v0[0]+","+v0[1]+"L"+v1[0]+","+v1[1]+"L"+v2[0]+","+v2[1]+"L"+v3[0]+","+v3[1]+"Z"
            };*/
            return [v0,v1,v2,v3];
        } else if ("square" === vType) {
            var v0 = [(gCenter[0]-size),(gCenter[1]+size)];
            var v1 = [(gCenter[0]+size),(gCenter[1]+size)];
            var v2 = [(gCenter[0]+size),(gCenter[1]-size)];
            var v3 = [(gCenter[0]-size),(gCenter[1]-size)];
            /*_graphicDom = {
                    "type" : "path",                    
                    "path" : "M"+v0[0]+","+v0[1]+"L"+v1[0]+","+v1[1]+"L"+v2[0]+","+v2[1]+"L"+v3[0]+","+v3[1]+"Z"
            };*/
            return [v0,v1,v2,v3];
        } else if ("x" === vType || "X" === vType) {
            var r = Math.round(Math.cos(45*rad)*size);
            var v0 = [gCenter[0]-r,gCenter[1]+r];
            var v1 = [gCenter[0]+r,gCenter[1]-r];
            var v2 = [gCenter[0]+r,gCenter[1]+r];
            var v3 = [gCenter[0]-r,gCenter[1]-r];
            /*_graphicDom = {
                    "type" : "path",                    
                    "path" : "M"+v0[0]+","+v0[1]+"L"+v1[0]+","+v1[1]+"M"+v2[0]+","+v2[1]+"L"+v3[0]+","+v3[1]+"Z"
            };*/
            return [v0,v1,v2,v3];
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

    getGeoIcon:function() {
        if (this.iconSymbol)  {
            return this.iconSymbol;
        }
        if (this.geometry) {
            return this.geometry.getIcon();
        }
    }
};