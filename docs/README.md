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
        所有的/**...*/包含的内容都会被收纳到文档中，所以不是文档注释，建议用//;
        



