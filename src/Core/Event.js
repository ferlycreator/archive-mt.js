/**
 * 事件处理机制,为需要的类添加事件处理机制
 * @class maptalks.Eventable
 * @author Maptalks Team
 */
Z.Eventable = {
    /**
     * 添加事件
     * @param {String} eventTypeArr 事件名字符串，多个事件名用空格分开
     * @param {Function} handler 事件触发后的回调函数
     * @param {Object} context 上下文对象
     * @return {Object} 上下文对象
     */
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

    /**
     * 删除事件
     * @param {String} eventTypeArr 事件名字符串，多个事件名用空格分开
     * @param {Function} handler 事件触发后的回调函数
     * @param {Object} context 上下文对象
     * @return {Object} 上下文对象
     */
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

    /**
     * 判断当前对象上是否绑定了某种类型的监听事件
     * @param {String} eventType 事件名
     * @return {Boolean} true,绑定了事件
     */
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
            //增加一个type参数, 表示事件类型
            param['type'] = eventType;
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

/**
 * 添加事件
 * @param {String} eventTypeArr 事件名字符串，多个事件名用空格分开
 * @param {Function} handler 事件触发后的回调函数
 * @param {Object} context 上下文对象
 * @return {Object} 上下文对象
 */
Z.Eventable.on = Z.Eventable['addEventListener'];

/**
 * 删除事件
 * @param {String} eventTypeArr 事件名字符串，多个事件名用空格分开
 * @param {Function} handler 事件触发后的回调函数
 * @param {Object} context 上下文对象
 * @return {Object} 上下文对象
 */
Z.Eventable.off = Z.Eventable['removeEventListener'];

Z.Eventable.bind = Z.Eventable['addEventListener'];
Z.Eventable.unbind = Z.Eventable['removeEventListener'];

/**
 * 执行事件
 * @param {String} eventType 事件名
 * @param {Object} param 参数
 */
Z.Eventable.fire = Z.Eventable._executeListeners;

/**
 * 判断当前对象上是否绑定了某种类型的监听事件
 * @param {String} eventType 事件名
 * @return {Boolean} true,绑定了事件
 */
Z.Eventable.isBind=Z.Eventable.hasListeners;