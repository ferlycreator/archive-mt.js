## MapTalks Api Docs


### I.[jsduck安装指导](https://github.com/senchalabs/jsduck/wiki/Installation)

### II. 生成文档，执行命令：gulp docs

### III.常用注释关键字说明及注意事项：

#### 1、类注释
        /**
         * 多边形类
         * @class maptalks.Polygon
         * @extends maptalks.Vector //父类的公有方法会出现在子类；
         * @mixins maptalks.Geometry.Poly //如果需要includes类的方法也出现在当前类，用minxins
         * @author Maptalks Team
         */
        Z['Polygon']=Z.Polygon = Z.Vector.extend({
        includes:[Z.Geometry.Poly]
        ....
        });
        
#### 2、构造函数注释
       /**
        * @constructor //关键字
        * @param {maptalks.Coordinate[]} coordinates
        * @param {Object} opts
        * @returns {maptalks.Polygon}
        */
       initialize:function(coordinates, opts) {
           this.setCoordinates(coordinates);
           this._initOptions(opts);
       }
       
#### 3、扩展属性注释
        Z.Geometry.mergeOptions({
            /**
             * @cfg {Boolean} [draggable="false"] geometry能否拖动
             * @member maptalks.Geometry //表明该属性扩展到maptalks.Geometry上，会出现在Geometry API文档的 Config options下
             */
        	'draggable': false,
        	/**
        	 * @cfg {String} [dragTrigger="mousedown"] geometry 拖动触发机制
             * @member maptalks.Geometry 
             */
        	'dragTrigger': 'mousedown'//manual
        });
         
#### 4、扩展方法注释
        /**
         * Geometry是否处于移动模式中
         * @member maptalks.Geometry //同上，会出现在文档的Methods下
         * @reutrn {Boolean} 是否处于移动模式中
         * @expose
         */
        isDragging: function() {
            if (this.isDragging) {
                return this.isDragging;
            }
            return false;
        }
        
#### 5、事件注释
        _endDrag: function(event) {
            。。。。。。
            /**
             * 触发geometry的dragend事件
             * @member maptalks.Geometry// 同上，会出现在文档的Events下
             * @event dragend //事件注释关键字
             * @return {Object} params: {'target':this}
             */
            this.fire('dragend', {'target': this});
        }
        
#### 6、注意事项
        所有的/**...*/包含的内容都会被收纳到文档中，所以不是文档注释，利用@ignore 或者“//”进行注释;
        
### 常用标签摘录：
#### [标签在线文档](https://github.com/senchalabs/jsduck/wiki)

        @author：作者  
        @class：类  
        @deprecated：标记此方法属性或者类不赞成使用，在升级过渡的时候需兼容之前的API时特别有用。  
        @example：给类或者方法添加一个代码范例，jsduck不仅会给代码着色，还能给代码生成一个代码编辑器，编辑代码后可实时预览，使用@example需要四个空格的缩进。  
        @extends：标记一个类继承自另一个类，生成后会有一个类型继承体系陈列在文档视图的右侧。  
        @cfg：构造器的配置项，并在其后跟随“{className}”，再跟随参数名。  
        范例：@cfg {String} fieldName配置项的描述。  
        @return：与@cfg类似，标记一个函数成员调用过后的返回类型。  
        范例：@return {Number} 文字描述  
        @param：与@cfg类似，给一个函数成员标记其所需的参数类型和描述，如果参数类型为多种可以用“/”分割，如需要给参数进行更详细描述还能使用“[param.member]”描述符。  
        范例：@param {Number/String} fieldName  
        范例：@param {String[]} fieldName  
        范例： /**  
        * @cfg {Object} opt  
        * @cfg {Number} [opt.age]  
        * @cfg {Number} [opt.name=0]  
        */  
        @event：标记一个事件，随后通常会跟随@param标签给事件回调函数声明参数的说明。  
        @inheritdoc：在其后跟随Class#member，常用在子类覆盖父类成员后，子类注释块还需继续使用父类注释的情况下使用。  
        @private：将成员标记成私有，虽然也有@public但如果不特殊标明即为公有。  
        @protected：将成员标记成受保护的。  
        @static:将成员标记成静态的，静态成员也会在文档中进行分类展示。  
        @img：在文档注释中链接一张图片，让文档变得更具可读性。  
        @link：在文档注释中标记某个类或类成员的锚点。
        
### 类层级调整

######maptalks
        .Map
        .Layer
        .Geometry
            .Marker
            .Point
            .Polyline
            .Polygon
            .MultiPoint
            .MultiPolyline
            .MultiPolygon
            .Circle
            .Ellipse
            .Rectangle
            .Sector
            .Vector
        .Control
            .Attribution
            .Nav
            .Scale
            .Zoom
            .Toolbar
            .Panel
            .Button 
            .InfoWindow
            .Label
            .Menu
        .Handler
           .Drag
           .Touch
        .Tool
            .ComputeAreaTool
            .DistanceTool
            .DrawTool
        .Utility
            .GeoUtils
            .SimplifyUtil
            .Util
            .DomUtil
            .Browser
            .Class
            .Event
            .Support
        .Render
            .xxxxx
        .Query
            .RemoteQuery
            .SpatialFilter
         
           
    
        
        
