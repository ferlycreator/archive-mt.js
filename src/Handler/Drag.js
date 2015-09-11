Z.Handler.Drag = Z.Handler.extend({

    initialize:function(dom, opts){
        this.dom = dom;
        if (opts) {
            Z.Util.extend(this,opts);
        }

    },

    enable:function(){
        if (!this.dom) {return;}
        Z.DomUtil.on(this.dom, 'mousedown', this.onMouseDown, this);
    },

    disable:function(){
        if (!this.dom) {return;}
        Z.DomUtil.off(this.dom, 'mousedown', this.onMouseDown);
    },

    onMouseDown:function(event) {
        var dom = this.dom;
        if(dom.setCapture) {
            dom.setCapture();
        } else if(window.captureEvents) {
            window.captureEvents(window['Event'].MOUSEMOVE|window['Event'].MOUSEUP);
        }
        dom['ondragstart'] = function() { return false; };
        this.moved = false;
        if (this.moving) { return; }
        this.startPos = new Z.Point(event.clientX, event.clientY);
        Z.DomUtil.on(dom,'mousemove',this.onMouseMove,this);
        Z.DomUtil.on(dom,'mouseup',this.onMouseUp,this);
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
            this.fire('dragstart',{
                'mousePos':new Z.Point(this.startPos.left, this.startPos.top)
            });
            this.moved = true;
        }
        this.moving = true;
        this.fire('dragging',{
            'mousePos': new Z.Point(event.clientX, event.clientY)
        });
    },

    onMouseUp:function(event){
        var dom = this.dom;
        Z.DomUtil.off(dom,'mousemove',this.onMouseMove);
        Z.DomUtil.off(dom,'mouseup',this.onMouseUp);
        if(dom['releaseCapture']) {
            dom['releaseCapture']();
        } else if(window.captureEvents) {
            window.captureEvents(window['Event'].MOUSEMOVE|window['Event'].MOUSEUP);
        }
        if (dom.style.cursor === 'move') {
            dom.style.cursor = 'default';
        }
        if (this.moved && this.moving) {
            this.fire('dragend',{
                'mousePos': new Z.Point(parseInt(event.clientX,0),parseInt(event.clientY,0))
            });
        }
        this.moving = false;
    }
});
