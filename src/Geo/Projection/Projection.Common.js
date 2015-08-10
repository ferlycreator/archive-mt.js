//---------------------------------------
//空间计算方法
//如计算长度,面积, 根据距离locate另一个点的坐标等
//---------------------------------------
Z.ProjectionInstance={};
Z.ProjectionInstance.GeoMethods={};
Z.ProjectionInstance.GeoMethods.Geodesic={
    getGeodesicLength:function(mlonlat1,mlonlat2){
        if (!mlonlat1 || !mlonlat2) {return 0;}
        try {
            var b=this.rad(mlonlat1.y),d=this.rad(mlonlat2.y),e=b-d,f=this.rad(mlonlat1.x)-this.rad(mlonlat2.x);
            b=2*Math.asin(Math.sqrt(Math.pow(Math.sin(e/2),2)+Math.cos(b)*Math.cos(d)*Math.pow(Math.sin(f/2),2)));b*=6378137;
            return Math.round(b*1E4)/1E4;
        } catch (err) {
            return 0;
        }   
    },
    getGeodesicArea:function(rings) {
        var a=6378137*Math.PI/180,
            b=0,
            c=rings,
            d=c.length;
        if (d<3) {return 0;}
        for(var i=0;i<d-1;i++)
        {
            var e=c[i],
                f=c[i+1];
            b+=e.x*a*Math.cos(e.y*Math.PI/180)*f.y*a-f.x*a*Math.cos(f.y*Math.PI/180)*e.y*a;
            // console.log(b);
        }
        d=c[i];
        c=c[0];
        b+=d.x*a*Math.cos(d.y*Math.PI/180)*c.y*a-c.x*a*Math.cos(c.y*Math.PI/180)*d.y*a;
        return 0.5*Math.abs(b);
    },
    locate:function(mlonlat, xDistance, yDistance) {
        if (!mlonlat) {return null;}
        if (!xDistance) {xDistance = 0;}
        if (!yDistance) {yDistance = 0;}
        if (!xDistance && !yDistance) {return mlonlat;}
        var dx = Math.abs(xDistance);
        var dy = Math.abs(yDistance);
        var ry = this.rad(mlonlat.y);
        var rx = this.rad(mlonlat.x);
        var sy = Math.sin(dy / (2 * 6378137)) * 2;
        ry = ry + sy * (yDistance > 0 ? 1 : -1);
        var sx = 2 * Math.sqrt(Math.pow(Math.sin(dx / (2 * 6378137)), 2)/ Math.pow(Math.cos(ry), 2));
        //              2 * Math.asin(Math.sqrt(Math.abs((Math.sin(xDistance
        //              / (2 * 6378137)))
        //              / (2 * Math.pow(Math.cos(ry), 2)))));
        rx = rx + sx * (xDistance > 0 ? 1 : -1);
        return {'x':rx * 180 / Math.PI, 'y':ry * 180 / Math.PI};
    }
};
Z.ProjectionInstance.GeoMethods.Pixel={
    getGeodesicLength:function(mlonlat1,mlonlat2){
        if (!mlonlat1 || !mlonlat2) {return 0;}
        try {
            return Math.sqrt(Math.pow(mlonlat1.x-mlonlat2.x,2)+Math.pow(mlonlat1.y-mlonlat2.y,2));
        } catch (err) {
            return 0;
        }   
    },
    getGeodesicArea:function(rings) {
        if (!Z.Util.isArrayHasData(rings)) {
            return 0;
        }
        var area = 0;
        for ( var i = 0, len = rings.length; i < len; i++) {
            var pLonlat = rings[i];
            var pLonlat2 = null;
            if (i === len - 1) {
                pLonlat2 = rings[0];
            } else {
                pLonlat2 = rings[i+1];
            }
            area += pLonlat.x * pLonlat2.y - pLonlat.y * pLonlat2.x;
        }
        return Math.abs(area / 2);
    },
    locate:function(mlonlat, xDistance, yDistance) {
        if (!mlonlat) {return null;}
        if (!xDistance) {xDistance = 0;}
        if (!yDistance) {yDistance = 0;}
        if (!xDistance && !yDistance) {return mlonlat;}
        return {'x':mlonlat.x+xDistance, 'y':mlonlat.y+yDistance};
    }
};