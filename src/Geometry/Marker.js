/**
 * 点类
 * @class maptalks.Marker
 * @extends maptalks.Geometry
 * @mixins maptalks.Geometry.Center
 * @author Maptalks Team
 */
Z['Marker']=Z.Marker=Z.Geometry.extend({
    includes:[Z.Geometry.Center],

    type: Z.Geometry['TYPE_POINT'],

    options:{
        'symbol':{
            'markerFile' : Z.prefix+'images/marker.png',
            'markerHeight' : 30,
            'markerWidth' : 22
        }
    },

    initialize:function(coordinates,opts) {
        this._coordinates = new Z.Coordinate(coordinates);
        this._initOptions(opts);
    },

    _containsPoint: function(point) {
        var pxExtent = this._getPainter().getPixelExtent();
        return pxExtent.contains(point);
    },

    _computeExtent: function(projection) {
        var coordinates = this.getCenter();
        if (!coordinates) {return null;}
        var _map = this.getMap();
        var containerPoint = _map.coordinateToContainerPoint(coordinates);
        var left = containerPoint['left'],top = containerPoint['top'];
        var symbol = this.getSymbol();
        var size = this.getSize();
        var width = size['width'],height = size['height'];
        if (!Z.Util.isNil(symbol['markerFile']) //image
           || (Z.Util.isNil(symbol['markerFile']) && !Z.Util.isNil(symbol['markerType']))) //vector
           {
            var p1 = _map.containerPointToCoordinate(new Z.Point(left+width/2,top+height/2));
            var p2 = _map.containerPointToCoordinate(new Z.Point(left-width/2,top-height/2));
            return new Z.Extent(p1,p2);
        }
        if (!Z.Util.isNil(symbol['textName'])) {//text
            var hAlign = symbol['textHorizontalAlignment'];
            var vAlign = symbol['textVerticalAlignment'];
            return this._computeTextExtent(projection, hAlign, vAlign);
        }
        if (!Z.Util.isNil(symbol['shieldName'])) {
            var hAlign = symbol['shieldHorizontalAlignment'];
            var vAlign = symbol['shieldVerticalAlignment'];
            return this._computeTextExtent(projection, hAlign, vAlign);
        }
    },

    _computeTextExtent: function(projection, hAlign, vAlign) {
        var coordinates = this.getCenter();
        var _map = this.getMap();
        var containerPoint = _map.coordinateToContainerPoint(coordinates);
        var left = containerPoint['left'],top = containerPoint['top'];

        var size = this.getSize();
        var width = size['width'],height = size['height'];
        var maxX=0,maxY=0,minX=0,minY=0;
        if (hAlign === 'left') {
            maxX = 0;
            minX = -width;
        } else if (hAlign === 'middle') {
            maxX = width/2;
            minX = -width/2
        } else {
            maxX = width;
            minX = 0;
        }

        if (vAlign === 'top') {
           maxY = height;
           minY = 0;
        } else if (vAlign === 'middle') {
            maxY = height/2;
            minY = -height/2;
        } else {
            maxY = 0;
            minY = -height;
        }
        var p1 = _map.containerPointToCoordinate(new Z.Point(left+maxX,top+maxY));
        var p2 = _map.containerPointToCoordinate(new Z.Point(left-maxX,top-maxY));
        return new Z.Extent(p1,p2);
    },


    _computeGeodesicLength:function(projection) {
        return 0;
    },

    _computeGeodesicArea:function(projection) {
        return 0;
    }
});
