/**
 * 拖动
 * @class maptalks.Handler.Drag
 * @extends maptalks.Handler
 * @author Maptalks Team
 */
Z.Handler.Drag = Z.Handler.extend({

    /**
     * @constructor
     * @param {HTMLElement} dom
     * @param {Object} opts
     */
    initialize:function(dom, opts){
        this.dom = dom;
        if (opts) {
            Z.Util.extend(this,opts);
        }
    },

    /**
     * 激活
     */
    enable:function(){
        if (!this.dom) {return;}
        Z.DomUtil.on(this.dom, 'mousedown', this.onMouseDown, this);
    },

    /**
     * 停止
     */
    disable:function(){
        if (!this.dom) {return;}
        Z.DomUtil.off(this.dom, 'mousedown', this.onMouseDown);
    },

    onMouseDown:function(event) {
        if (Z.Util.isNumber(event.button) && event.button === 2) {
            //不响应右键事件
            return;
        }
        var dom = this.dom;
        if(dom.setCapture) {
            dom.setCapture();
        } else if(window.captureEvents) {
            window.captureEvents(window['Event'].MOUSEMOVE|window['Event'].MOUSEUP);
        }
        dom['ondragstart'] = function() { return false; };
        this.moved = false;
        // if (this.moving) { return; }
        this.startPos = new Z.Point(event.clientX, event.clientY);
        //2015-10-26 fuzhen 改为document, 解决鼠标移出地图容器后的不可控现象
        Z.DomUtil.on(document,'mousemove',this.onMouseMove,this);
        Z.DomUtil.on(document,'mouseup',this.onMouseUp,this);
    },

    onMouseMove:function(event) {
        var dom = this.dom;
        var newPos = new Z.Point(event.clientX, event.clientY),
            offset = newPos.substract(this.startPos);
        if (!offset.left && !offset.top) {
            return;
        }
        if (!this.moved) {
            if (!dom.style.cursor || dom.style.cursor === 'default') {
                dom.style.cursor = 'move';
            }
            /**
             * 触发dragstart事件
             * @event dragstart
             * @return {Object} mousePos: {'left': 0px, 'top': 0px}
             */
            this.fire('dragstart',{
                'mousePos':new Z.Point(this.startPos.left, this.startPos.top)
            });
            this.moved = true;
        } else {
             /**
             * 触发dragging事件
             * @event dragging
             * @return {Object} mousePos: {'left': 0px, 'top': 0px}
             */
            try {
                this.fire('dragging',{
                    'mousePos': new Z.Point(event.clientX, event.clientY)
                });
            } catch (error) {
                Z.DomUtil.off(document,'mousemove',this.onMouseMove);
                Z.DomUtil.off(document,'mouseup',this.onMouseUp);
            }

        }
        // this.moving = true;


    },

    onMouseUp:function(event){
        var dom = this.dom;
        Z.DomUtil.off(document,'mousemove',this.onMouseMove);
        Z.DomUtil.off(document,'mouseup',this.onMouseUp);
        if(dom['releaseCapture']) {
            dom['releaseCapture']();
        } else if(window.captureEvents) {
            window.captureEvents(window['Event'].MOUSEMOVE|window['Event'].MOUSEUP);
        }
        if (dom.style.cursor === 'move') {
            dom.style.cursor = 'default';
        }
        if (this.moved/* && this.moving*/) {
            /**
             * 触发dragend事件
             * @event dragend
             * @return {Object} mousePos: {'left': 0px, 'top': 0px}
             */
            this.fire('dragend',{
                'mousePos': new Z.Point(parseInt(event.clientX,0),parseInt(event.clientY,0))
            });
        }
        // this.moving = false;
    }
});
