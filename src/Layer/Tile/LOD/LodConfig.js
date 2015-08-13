Z.LodConfig=Z.Class.extend({
 
        includes:Z.LodUtil.Common, 

        //根据不同的语言定义不同的错误信息
        'exceptionDefs':{
            'en-US':{
                'INVALID_CRS':'Invalid CRS'
            },
            'zh-CN':{
                'INVALID_CRS':'无效的CRS'
            }
        },

        /**
         * 初始化方法
         * @param  {[LodInfo]} lodInfo [图层配置属性,参考LodInfo.js中的例子]
         * @return {[type]}         [description]
         */
        initialize:function(lodInfo) {
            if (!this.checkLodInfo(lodInfo)) {return;} 
            //lodInfo是预设值的字符串
            var lodName = null;
            if (Z.Util.isString(lodInfo)) { 
                lodName = lodInfo;
                lodInfo = Z['LodInfo'][lodInfo.toLowerCase()];
                if (!lodInfo) {
                    throw new Error(this.exceptions['INVALID_CRS']+':'+lodName);
                }
            }
            this.lodInfo = lodInfo; 
            Z.Util.extend(this,lodInfo);
            if (!this['padding']) {
                this['padding'] = {
                    'width':0,
                    'height':0
                };
            }
            this.projectionInstance = Z.Projection.getInstance(lodInfo['projection']);
            if ('baidu' === lodInfo['projection'].toLowerCase()) {
                Z.Util.extend(this,Z.LodUtil.BD09);
            }  else {
                if (lodName && 'globalmercator' === lodName) {
                    Z.Util.extend(this,Z.LodUtil.GLOALMERCATOR);
                } else {
                    Z.Util.extend(this,Z.LodUtil.Default);
                }

            }
            if (this['origin']) {
                //direction of projected coordinate
                this.dx = (this['origin']['right']>=this['origin']['left'])?1:-1;
                this.dy = (this['origin']['top']>=this['origin']['bottom'])?1:-1;
            }
        },

        checkLodInfo:function(lodInfo) {
            if (!lodInfo) {return false;}
            if (Z.Util.isString(lodInfo) && (Z['LodInfo'][lodInfo.toLowerCase()])) {
                return true;
            }
            if (!lodInfo['srs']) {
                return false;
            }
            return true;
        },

        load:function(afterLoadFn){
            //如果已经有resolutions等属性,则说明无需初始化
            if (this['resolutions']) {
                if (afterLoadFn) {
                    afterLoadFn();
                }
                return;
            }
            //TODO arcgis初始化
        },

        equals:function(lodConfig, zoomLevel) {
            try {
                return lodConfig['resolutions'][zoomLevel] === this['resolutions'][zoomLevel] && 
                this['projection'] === lodConfig['projection'];             
            } catch (error) {
                return false;
            }
            
        },

        getProjectionInstance:function() {

            return this.projectionInstance;
        },

        getResolution:function(z) {
            if (this['resolutions']) {
                return this['resolutions'][z];
            }
            return 0;
        }

        
});

