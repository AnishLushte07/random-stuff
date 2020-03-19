(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('strophe.js')) :
	typeof define === 'function' && define.amd ? define(['strophe.js'], factory) :
	(factory(global.window));
}(this, (function (strophe_js) { 'use strict';

/* XEP-0313: Message Archive Management
 * Copyright (C) 2012 Kim Alvefur
 *
 * This file is MIT/X11 licensed. Please see the
 * LICENSE.txt file in the source package for more information.
 *
 * Modified by: Chris Tunbridge (github.com/Destreyf/)
 * Updated to support v0.3 of the XMPP XEP-0313 standard
 * http://xmpp.org/extensions/xep-0313.html
 *
 */
strophe_js.Strophe.addConnectionPlugin('httpUpload', {
    _c: null,
    init: function (conn) {
        this._c = conn;
        strophe_js.Strophe.addNamespace('HTTP_UPLOAD', 'urn:xmpp:http:upload:0');
    },
    discover: function (success_cb, error_cb) {
        var iq = strophe_js.$iq({
            'type': 'get',
            'from': this._c.jid,
            'to': strophe_js.Strophe.getDomainFromJid(this._c.jid),
            'id': this._c.getUniqueId()
        })
            .c('query', {
                'xmlns': strophe_js.Strophe.NS.DISCO_ITEMS
            });

        this._c.sendIQ(iq, success_cb, error_cb);
    },
    getMaxSize: function (service, success_cb, error_cb) {
        var iq = strophe_js.$iq({
            'type': 'get',
            'from': this._c.jid,
            'to': service,
            'id': this._c.getUniqueId()
        })
            .c('query', {
                'xmlns': strophe_js.Strophe.NS.DISCO_INFO
            });

        this._c.sendIQ(iq, success_cb, error_cb);
    },
    getSlot: function (service, file, success_cb, error_cb) {
        var iq = strophe_js.$iq({
            'type': 'get',
            'from': this._c.jid,
            'to': service,
            'id': this._c.getUniqueId()
        })
            .c('request', {
                'xmlns': strophe_js.Strophe.NS.HTTP_UPLOAD,
                'filename': file.name,
                'size': file.size,
                'content-type': file.type
            });

        console.log('get slot iq', iq)    

        this._c.sendIQ(iq, success_cb, error_cb);
    },
    query: function (jid, options) {
        var _p = this._p;
        var attr = {
            type:'set',
            to:jid
        };
        options = options || {};
        var mamAttr = {xmlns: strophe_js.Strophe.NS.MAM};
        if (!!options.queryid) {
            mamAttr.queryid = options.queryid;
            delete options.queryid;
        }
        var iq = strophe_js.$iq(attr).c('query', mamAttr).c('x',{xmlns:'jabber:x:data', type:'submit'});

        iq.c('field',{var:'FORM_TYPE', type:'hidden'}).c('value').t(strophe_js.Strophe.NS.MAM).up().up();
        var i;
        for (i = 0; i < this._p.length; i++) {
            var pn = _p[i];
            var p = options[pn];
            delete options[pn];
            if (!!p) {
                iq.c('field',{var:pn}).c('value').t(p).up().up();
            }
        }
        iq.up();

        var onMessage = options.onMessage;
        delete options.onMessage;
        var onComplete = options.onComplete;
        delete options.onComplete;
        iq.cnode(new strophe_js.Strophe.RSM(options).toXML());

        var _c = this._c;
        var handler = _c.addHandler(onMessage, strophe_js.Strophe.NS.MAM, 'message', null);
        return this._c.sendIQ(iq, function(){
           _c.deleteHandler(handler);
           onComplete.apply(this, arguments);
        },
            function(err){
                //error callBack function
                console.log("Error Response from server:", err);
            });
    }
});

})));
//# sourceMappingURL=strophe.mam.js.map
