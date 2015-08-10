Z['HeatmapLayer'] = Z.HeatmapLayer = Z.Layer.extend({

      statics:{
          CSS_TRANSFORM: (function() {
               var div = Z.DomUtil.createEl('div');
               var props = [
               'transform',
               'WebkitTransform',
               'MozTransform',
               'OTransform',
               'msTransform'
               ];

               for (var i = 0; i < props.length; i++) {
                 var prop = props[i];
                 if (div.style[prop] !== undefined) {
                   return prop;
                 }
               }
               return props[0];
             })()

      },

      initialize: function (config) {
        this.cfg = config;
        this._el = Z.DomUtil.createEl('div');
        this._data = [];
        this._max = 1;
        this.cfg.container = this._el;
      },

      onAdd: function (map) {
        var size = map.getSize();

        this._map = map;

        this._width = size.width;
        this._height = size.height;

        this._el.style.width = this._width  + 'px';
        this._el.style.height = this._height + 'px';
        this._el.style["z-index"] = 300;

        this._resetOrigin();

        map.getPanels().appendChild(this._el);

        if (!this._heatmap) {
          this._heatmap = h337.create(this.cfg);
        }

        // on zoom, reset origin
        map.on('zoomend', this._resetOrigin, this);
        // redraw whenever dragend
        map.on('dragend', this._draw, this);

        this._draw();
      },

      onRemove: function (map) {
        // remove layer's DOM elements and listeners
        map.getPanels().removeChild(this._el);

        map.off('zoomend', this._resetOrigin, this);
        map.off('dragend', this._draw, this);
      },

      _draw: function() {
        if (!this._map) { return; }
        /**
        * 将投影坐标转化为屏幕偏移坐标
        */
        var point = this._map.coordinateToScreenPoint(this._origin);

        // reposition the layer
        this._el.style[Z.HeatmapLayer.CSS_TRANSFORM] = 'translate(' +
          -Math.round(point.left) + 'px,' +
          -Math.round(point.top) + 'px)';

        this._update();
      },

      _update: function() {
        var bounds, zoom, scale;

        bounds = this._map.getExtent();
        zoom = this._map.getZoomLevel();
        scale = Math.pow(2, zoom);

        if (this._data.length == 0) {
          return;
        }

        var generatedData = { max: this._max };
        var latLngPoints = [];
        var radiusMultiplier = this.cfg.scaleRadius ? scale : 1;
        var localMax = 0;
        var valueField = this.cfg.valueField;
        var len = this._data.length;

        while (len--) {
          var entry = this._data[len];
          var value = entry[valueField];
          var coordinate = entry.coordinate;

          // we don't wanna render points that are not even on the map ;-)
          if (!Z.GeoUtils.isPointInRect(coordinate, bounds)) {
            continue;
          }
          // local max is the maximum within current bounds
          if (value > localMax) {
            localMax = value;
          }

          if(!Z.GeoUtils.isPointInRect(coordinate, bounds)) {
            continue;
          }

          var point = this._map.coordinateToScreenPoint(coordinate);
          var latlngPoint = { x: Math.round(point.left), y: Math.round(point.top) };
          latlngPoint[valueField] = value;

          var radius;

          if (entry.radius) {
            radius = entry.radius * radiusMultiplier;
          } else {
            radius = (this.cfg.radius || 2) * radiusMultiplier;
          }
          latlngPoint.radius = radius;
          latLngPoints.push(latlngPoint);
        }
        if (this.cfg.useLocalExtrema) {
          generatedData.max = localMax;
        }

        generatedData.data = latLngPoints;

        this._heatmap.setData(generatedData);
      },

      setData: function(data) {
        this._max = data.max || this._max;
        var yField = this.cfg.yField || 'y';
        var xField = this.cfg.xField || 'x';
        var valueField = this.cfg.valueField || 'value';

        // transform data to latlngs
        var data = data.data;
        var len = data.length;
        var d = [];

        while (len--) {
          var entry = data[len];
          var coordinate = new Z.Coordinate( entry[xField], entry[yField]);
          var dataObj = { coordinate: coordinate };
          dataObj[valueField] = entry[valueField];
          if (entry.radius) {
            dataObj.radius = entry.radius;
          }
          d.push(dataObj);
        }
        this._data = d;

        this._draw();
      },

      addData: function(pointOrArray) {
        if (pointOrArray.length > 0) {
          var len = pointOrArray.length;
          while(len--) {
            this.addData(pointOrArray[len]);
          }
        } else {
          var yField = this.cfg.yField || 'y';
          var xField = this.cfg.xField || 'x';
          var valueField = this.cfg.valueField || 'value';
          var entry = pointOrArray;
          var coordinate = new Z.Coordinate(entry[xField], entry[yField]);
          var dataObj = { coordinate: coordinate };

          dataObj[valueField] = entry[valueField];
          this._max = Math.max(this._max, dataObj[valueField]);

          if (entry.radius) {
            dataObj.radius = entry.radius;
          }
          this._data.push(dataObj);
          this._draw();
        }
      },

      _resetOrigin: function () {
        this._origin = this._map.screenPointToCoordinate(new Z.Point(0, 0));
        this._draw();
      }

});