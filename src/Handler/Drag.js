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
        Z.DomUtil.on(dom,'mousemove',this.onMouseMove,this);
        Z.DomUtil.on(dom,'mouseup',this.onMouseUp,this);
        if (!dom.style.cursor || dom.style.cursor === 'default') {
            dom.style.cursor = 'move';
        }
        this.fire('dragstart',{
            'mousePos':{
                'left': parseInt(event.clientX,0),
                'top': parseInt(event.clientY,0)
            }
        });
    },

    onMouseMove:function(event) {
        this.fire('dragging',{
            'mousePos':{
                'left':parseInt(event.clientX,0),
                'top':parseInt(event.clientY,0)
            }
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
        this.fire('dragend',{
            'mousePos':{
                'left':parseInt(event.clientX,0),
                'top':parseInt(event.clientY,0)
            }
        });
    }
});