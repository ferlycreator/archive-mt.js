Z.Map.include({
	/**
     * 截图
     * @param  {Object} config 截图设置
     * @expose
     */
    snap:function(config) {
        var callback = config['success'];
        var onErrorFn = config['error'];
        var extent = config['extent'];
        var zoomLevel = config['zoomLevel'];
        var geometries = config['geometries'];
        var resultType = config['resultType'];
        var ignoreBase = config['ignoreBase'];
        var lodConfig = this.getLodConfig();
        if (!lodConfig) {
            return;
        }
        var projection = this.getProjection();
        if (!extent) {
            extent = this.getExtent();              
        }
        if (Z.Util.isNil(zoomLevel)) {
            zoomLevel = this.getZoomLevel();
        }
        if (zoomLevel < lodConfig['minZoomLevel']) {
            zoomLevel = lodConfig['minZoomLevel'];
        } else if (zoomLevel > lodConfig['maxZoomLevel']) {
            zoomLevel = lodConfig['maxZoomLevel'];
        }
        var snapSettings = {
            'projection':lodConfig['projection'],
            'res':lodConfig['resolutions'][zoomLevel],
            'extent': extent.toJson()            
        };   
        var layerSettings = {};
        var baseTileLayer = this.getBaseTileLayer();            
        if (baseTileLayer) {
            var layerInfo = genLayerInfo(baseTileLayer);
            var tileNum = layerInfo.num;
            if (tileNum > 3000) {
                if (tileNum > 10000) {
                    alert("截图大小预计会超过150M，请缩小截图范围后再继续截图");
                    return;
                }
                if (!confirm("截图文件大小预计会超过50M，请确定是否继续截图？")) {
                    return;
                }
            }
            if (!ignoreBase) {
                layerSettings['base']=layerInfo.info;
                // params += "\"base\":";
                // params += layerInfo.info+",";
            }
        }
        if (this.tileLayers.length >0){
            var tileLayerSettings=[];
            var tileLayers =this.tileLayers;
            for (var i=0,len=tileLayers.length;i<len;i++) {
                tileLayerSettings.push(genLayerInfo(tileLayers[i]).info);
            }                       
            layerSettings['tilelayers'] = tileLayerSettings;
        }
        if (this.dynLayers.length>0) {
                //动态图层
            var dynLayerSettings = [];
            var dynLayers =this.dynLayers;
            for (var i=0,len=dynLayers.length;i<len;i++) {
                dynLayerSettings.push(genDynlayerInfo(dynLayers[i]));
            }                       
            layerSettings['dynlayers'] = dynLayerSettings;
        }
        var geoJson = [];   
        var markerJson = [];
        if (!geometries || geometries.length === 0) {
            if (this.canvasLayers.length>0) {
                collectLayers(this.canvasLayers);
            }
            if (this.svgLayers.length>0) {
                collectLayers(this.svgLayers);
            }
        } else {
            collectGeos(geometries);
        }
        
        layerSettings['geos'] = geoJson.concat(markerJson);
        snapSettings['layers'] = layerSettings;
        
        
        var url = Z.host + "/snapservice/snap";
        var queryString = "config="+encodeURIComponent(JSON.stringify(snapSettings));
        var ajax = new Z.Util.Ajax(url, 0, queryString, function(resultText) {
            //console.log(resultText);
            var result = Z.Util.parseJson(resultText);
            if (!result || !result['success']) {
                if (onErrorFn) {
                    onErrorFn(result);                          
                }
                return;
            }
            if (result["success"]) {
                var url = null;
                if ('picture' === resultType) {
                    url = Z.host + '/snapservice/snapshots/'+result["data"];
                } else {
                    url = Z.host + "/snapservice/snapshots/fetch.html?url="+result["data"];
                }
                callback(url); 
            }
            
        });
        ajax.post();
        
        function collectLayers(layerList) {
            for (var i=0, len=layerList.length;i<len;i++) {
                if (!layerList[i] || !layerList[i].isVisible()) {continue;}
                var geos = layerList[i]["getAllGeometries"]();
                collectGeos(geos);
            }
        }
        
        function collectGeos(geos) {
            if (!geos) {return;}
            for (var j=0, jLen = geos.length;j<jLen;j++) {
                if (!geos[j].isVisible()) {continue;}
                var geoExtent = geos[j].getExtent();
                if (!Z.Extent.isIntersect(geoExtent,extent)) {
                    continue;
                }
                var layer = geos[j].getLayer();
                if (layer instanceof Z.SVGLayer && 
                    Z.Geometry["TYPE_POINT"] === geos[j].getType()) {
                    var jStr =geos[j].toJson({'attributes':false});
                    markerJson.push(jStr);
                } else {
                    var jStr = geos[j].toJson({'attributes':false});
                    geoJson.push(jStr);
                }
            }
        }

        function genDynlayerInfo(layer) {
            //var lConfig = layer.config;
             var nwTileInfo = lodConfig.getCenterTileInfo(projection.project({x:extent['xmin'],y:extent['ymax']}), zoomLevel);
             var seTileInfo = lodConfig.getCenterTileInfo(projection.project({x:extent['xmax'],y:extent['ymin']}), zoomLevel);
            var dynLayerSetting = {
                'url':layer.getTileUrl("%s","%s","%s"),
                'session':layer.sessionId,
                'tileSize': {
                    'height':lodConfig["tileSize"]["height"],
                    'width':lodConfig["tileSize"]["width"]
                },
                'padding':{
                    'height':lodConfig["padding"]["height"],
                    'width':lodConfig["padding"]["width"]  
                },
                'nw':{
                    'x':nwTileInfo['x'],
                    'y':nwTileInfo['y'],
                    'ox':nwTileInfo['offsetLeft'],
                    'oy':nwTileInfo['offsetTop']
                },
                'se':{
                    'x':seTileInfo['x'],
                    'y':seTileInfo['y'],
                    'ox':seTileInfo['offsetLeft'],
                    'oy':seTileInfo['offsetTop']
                }

            };         
            
            var xFactor = nwTileInfo["x"]<seTileInfo["x"];
            var yFactor = nwTileInfo["y"]<seTileInfo["y"];
            
            var tileParams = [];
            for (var i=nwTileInfo["x"];(xFactor?i<=seTileInfo["x"]:i>=seTileInfo["x"]);(xFactor?i++:i--)) {
                for (var j=nwTileInfo["y"];(yFactor?j<=seTileInfo["y"]:j>=seTileInfo["y"]);(yFactor?j++:j--)) {
                    tileParams.push("\""+layer._getRequestUrlParams(j,i,zoomLevel)+"\"");   
                    
                }
            }
            dynLayerSettings['tiles']=tileParams;
            return dynLayerSettings;
        }
        
        function genLayerInfo(layer) {
            var nwTileInfo = lodConfig.getCenterTileInfo(projection.project({x:extent['xmin'],y:extent['ymax']}), zoomLevel);
            var seTileInfo = lodConfig.getCenterTileInfo(projection.project({x:extent['xmax'],y:extent['ymin']}), zoomLevel);
            var tileLayerSettings={
                'tileSize':{
                     'height':lodConfig["tileSize"]["height"],
                    'width':lodConfig["tileSize"]["width"]
                },
                'padding':{
                    'height':lodConfig["padding"]["height"],
                    'width':lodConfig["padding"]["width"]  
                },
                'zoomLevel':zoomLevel,
                'url':layer.getTileUrl("%s","%s","%s"),
                'nw':{
                    'x':nwTileInfo['x'],
                    'y':nwTileInfo['y'],
                    'ox':nwTileInfo['offsetLeft'],
                    'oy':nwTileInfo['offsetTop']
                },
                'se':{
                    'x':seTileInfo['x'],
                    'y':seTileInfo['y'],
                    'ox':seTileInfo['offsetLeft'],
                    'oy':seTileInfo['offsetTop']
                }

            };
          
            return {info:tileLayerSettings,num:tileNum};
        }

    }
});