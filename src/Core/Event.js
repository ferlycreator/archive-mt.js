/*
*   事件处理机制,为需要的类添加事件处理机制
*/
Z.Eventable={
    "addEventListener":function(eventTypeArr, handler, context) {
        if (!eventTypeArr || !handler) {return this;}
        if (!this._eventMap) {
            this._eventMap = {};
        }
        var eventTypes = eventTypeArr.split(' ');
        var eventType;
        if(!context) {context = this;}
        for (var j = 0, jl = eventTypes.length; j <jl; j++) {
            eventType = eventTypes[j];
            var handlerChain = this._eventMap[eventType];
            if (!handlerChain) {
                handlerChain = [];
                this._eventMap[eventType]=handlerChain;
            }
            for (var i=0, len=handlerChain.length;i<len;i++) {
                if (handler == handlerChain[i].handler) {
                    if ((context && handlerChain[i].context == context) || (Z.Util.isNil(context) && Z.Util.isNil(handlerChain[i].context))) {
                        return this;
                    }
                }
            }
            handlerChain.push({
                handler:handler,
                context:context
            });
        }
        return this;
    },

    "removeEventListener":function(eventTypeArr, handler, context) {
        if (!eventTypeArr || !this._eventMap || !handler) {return this;}
        var eventTypes = eventTypeArr.split(' ');
        var eventType;
        if(!context) {context = this;}
        for (var j = 0, jl = eventTypes.length; j <jl; j++) {
            eventType = eventTypes[j];
            var handlerChain =  this._eventMap[eventType];
            if (!handlerChain) {return this;}
            var hits = [];
            for (var i=0, len= handlerChain.length;i<len;i++) {
                if (handler == handlerChain[i].handler) {
                    if ((context && (handlerChain[i].context == context)) || Z.Util.isNil(context)) {
                        hits.push(i);
                    }
                }
            }
            if (hits.length > 0) {
                for (var len=hits.length, i=len-1;i>=0;i--) {
                    handlerChain.splice(hits[i],1);
                }
                // handlerChain.splice(start,1);
            }
        }
        return this;
    },

    _clearListeners:function(eventType) {
        if (!this._eventMap) {return;}
        var handlerChain =  this._eventMap[eventType];
        if (!handlerChain) {return;}
        this._eventMap[eventType] = null;
    },

    _clearAllListeners:function() {
        this._eventMap = null;
    },

    hasListeners:function(eventType) {
        if (!this._eventMap) {return false;}
        var handlerChain =  this._eventMap[eventType];
        if (!handlerChain) {return false;}
        return handlerChain && handlerChain.length >0;
    },

    _executeListeners:function(eventType, param) {
        if (!this._eventMap) {return;}
        if (!this.hasListeners(eventType)) {return;}
        var handlerChain = this._eventMap[eventType];
        if (!handlerChain) {return;}
        for (var i=0, len = handlerChain.length;i<len; i++) {
            if (!handlerChain[i]) {continue;}
            var context = handlerChain[i].context;
            if (context) {
                if (!param) {
                    param = {};
                }
                handlerChain[i].handler.call(context,param);
            } else {
                handlerChain[i].handler(param);
            }
        }
    }
};
Z.Eventable.on = Z.Eventable['addEventListener'];
Z.Eventable.off = Z.Eventable['removeEventListener'];

Z.Eventable.bind = Z.Eventable['addEventListener'];
Z.Eventable.unbind = Z.Eventable['removeEventListener'];
Z.Eventable.fire = Z.Eventable._executeListeners;
Z.Eventable.isBind=Z.Eventable.hasListeners;