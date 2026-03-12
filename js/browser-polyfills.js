/**
 * 브라우저 호환성 Polyfills
 * IE11, 구형 Safari, Firefox 등을 지원하기 위한 polyfill 모음
 */

(function() {
    'use strict';

    // ========================================
    // Promise Polyfill (IE11)
    // ========================================
    if (typeof Promise === 'undefined') {
        window.Promise = function(executor) {
            var self = this;
            self.state = 'pending';
            self.value = undefined;
            self.handlers = [];

            function resolve(value) {
                if (self.state === 'pending') {
                    self.state = 'fulfilled';
                    self.value = value;
                    self.handlers.forEach(function(handler) {
                        handler.onFulfilled(value);
                    });
                }
            }

            function reject(reason) {
                if (self.state === 'pending') {
                    self.state = 'rejected';
                    self.value = reason;
                    self.handlers.forEach(function(handler) {
                        handler.onRejected(reason);
                    });
                }
            }

            self.then = function(onFulfilled, onRejected) {
                return new Promise(function(resolve, reject) {
                    function handle() {
                        if (self.state === 'fulfilled') {
                            try {
                                var result = onFulfilled ? onFulfilled(self.value) : self.value;
                                resolve(result);
                            } catch (error) {
                                reject(error);
                            }
                        } else if (self.state === 'rejected') {
                            try {
                                if (onRejected) {
                                    var result = onRejected(self.value);
                                    resolve(result);
                                } else {
                                    reject(self.value);
                                }
                            } catch (error) {
                                reject(error);
                            }
                        }
                    }

                    if (self.state === 'pending') {
                        self.handlers.push({
                            onFulfilled: onFulfilled || function(v) { return v; },
                            onRejected: onRejected || function(e) { throw e; }
                        });
                    } else {
                        setTimeout(handle, 0);
                    }
                });
            };

            self.catch = function(onRejected) {
                return self.then(null, onRejected);
            };

            try {
                executor(resolve, reject);
            } catch (error) {
                reject(error);
            }
        };

        Promise.resolve = function(value) {
            return new Promise(function(resolve) {
                resolve(value);
            });
        };

        Promise.reject = function(reason) {
            return new Promise(function(resolve, reject) {
                reject(reason);
            });
        };

        Promise.all = function(promises) {
            return new Promise(function(resolve, reject) {
                var results = [];
                var remaining = promises.length;

                if (remaining === 0) {
                    resolve(results);
                    return;
                }

                promises.forEach(function(promise, index) {
                    Promise.resolve(promise).then(function(value) {
                        results[index] = value;
                        remaining--;
                        if (remaining === 0) {
                            resolve(results);
                        }
                    }, reject);
                });
            });
        };
    }

    // ========================================
    // Fetch Polyfill (IE11)
    // ========================================
    if (typeof fetch === 'undefined') {
        window.fetch = function(url, options) {
            options = options || {};
            
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                
                xhr.open(options.method || 'GET', url, true);
                
                // Set headers
                if (options.headers) {
                    for (var key in options.headers) {
                        if (options.headers.hasOwnProperty(key)) {
                            xhr.setRequestHeader(key, options.headers[key]);
                        }
                    }
                }
                
                xhr.onload = function() {
                    var response = {
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        headers: parseHeaders(xhr.getAllResponseHeaders()),
                        url: url,
                        text: function() {
                            return Promise.resolve(xhr.responseText);
                        },
                        json: function() {
                            try {
                                return Promise.resolve(JSON.parse(xhr.responseText));
                            } catch (e) {
                                return Promise.reject(e);
                            }
                        }
                    };
                    
                    resolve(response);
                };
                
                xhr.onerror = function() {
                    reject(new Error('Network request failed'));
                };
                
                xhr.ontimeout = function() {
                    reject(new Error('Network request timed out'));
                };
                
                xhr.send(options.body || null);
            });
        };
        
        function parseHeaders(headersString) {
            var headers = {};
            if (!headersString) return headers;
            
            var lines = headersString.trim().split('\n');
            lines.forEach(function(line) {
                var parts = line.split(':');
                var key = parts.shift().trim().toLowerCase();
                var value = parts.join(':').trim();
                headers[key] = value;
            });
            
            return headers;
        }
    }

    // ========================================
    // Object.assign Polyfill (IE11)
    // ========================================
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target) {
            if (target === null || target === undefined) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource !== null && nextSource !== undefined) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    // ========================================
    // Array.from Polyfill (IE11)
    // ========================================
    if (!Array.from) {
        Array.from = function(arrayLike) {
            var array = [];
            for (var i = 0; i < arrayLike.length; i++) {
                array.push(arrayLike[i]);
            }
            return array;
        };
    }

    // ========================================
    // Array.prototype.find Polyfill (IE11)
    // ========================================
    if (!Array.prototype.find) {
        Array.prototype.find = function(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        };
    }

    // ========================================
    // Array.prototype.findIndex Polyfill (IE11)
    // ========================================
    if (!Array.prototype.findIndex) {
        Array.prototype.findIndex = function(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        };
    }

    // ========================================
    // Array.prototype.includes Polyfill (IE11)
    // ========================================
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement) {
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1]) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {
                    k = 0;
                }
            }
            while (k < len) {
                var currentElement = O[k];
                if (searchElement === currentElement ||
                   (searchElement !== searchElement && currentElement !== currentElement)) {
                    return true;
                }
                k++;
            }
            return false;
        };
    }

    // ========================================
    // String.prototype.includes Polyfill (IE11)
    // ========================================
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }

            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }

    // ========================================
    // String.prototype.startsWith Polyfill (IE11)
    // ========================================
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(search, pos) {
            pos = !pos || pos < 0 ? 0 : +pos;
            return this.substring(pos, pos + search.length) === search;
        };
    }

    // ========================================
    // String.prototype.endsWith Polyfill (IE11)
    // ========================================
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(search, this_len) {
            if (this_len === undefined || this_len > this.length) {
                this_len = this.length;
            }
            return this.substring(this_len - search.length, this_len) === search;
        };
    }

    // ========================================
    // String.prototype.repeat Polyfill (IE11)
    // ========================================
    if (!String.prototype.repeat) {
        String.prototype.repeat = function(count) {
            if (this == null) {
                throw new TypeError('can\'t convert ' + this + ' to object');
            }
            var str = '' + this;
            count = +count;
            if (count != count) {
                count = 0;
            }
            if (count < 0) {
                throw new RangeError('repeat count must be non-negative');
            }
            if (count == Infinity) {
                throw new RangeError('repeat count must be less than infinity');
            }
            count = Math.floor(count);
            if (str.length == 0 || count == 0) {
                return '';
            }
            var maxCount = str.length * count;
            count = Math.floor(Math.log(count) / Math.log(2));
            while (count) {
                str += str;
                count--;
            }
            str += str.substring(0, maxCount - str.length);
            return str;
        };
    }

    // ========================================
    // Number.isNaN Polyfill (IE11)
    // ========================================
    if (!Number.isNaN) {
        Number.isNaN = function(value) {
            return typeof value === 'number' && value !== value;
        };
    }

    // ========================================
    // Number.isInteger Polyfill (IE11)
    // ========================================
    if (!Number.isInteger) {
        Number.isInteger = function(value) {
            return typeof value === 'number' && 
                   isFinite(value) && 
                   Math.floor(value) === value;
        };
    }

    // ========================================
    // Element.closest Polyfill (IE11)
    // ========================================
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(selector) {
            var el = this;
            while (el) {
                if (el.matches(selector)) {
                    return el;
                }
                el = el.parentElement;
            }
            return null;
        };
    }

    // ========================================
    // Element.matches Polyfill (IE11)
    // ========================================
    if (!Element.prototype.matches) {
        Element.prototype.matches = 
            Element.prototype.matchesSelector || 
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector || 
            Element.prototype.oMatchesSelector || 
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s);
                var i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    // ========================================
    // classList Polyfill (IE11 개선)
    // ========================================
    if (!('classList' in document.createElement('_'))) {
        (function(view) {
            if (!('Element' in view)) return;

            var classListProp = 'classList',
                protoProp = 'prototype',
                elemCtrProto = view.Element[protoProp],
                objCtr = Object,
                strTrim = String[protoProp].trim || function() {
                    return this.replace(/^\s+|\s+$/g, '');
                },
                arrIndexOf = Array[protoProp].indexOf || function(item) {
                    var i = 0, len = this.length;
                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                };

            var DOMTokenList = function(elem) {
                var classes = strTrim.call(elem.getAttribute('class') || ''),
                    classList = classes ? classes.split(/\s+/) : [],
                    i = 0,
                    len = classList.length;

                for (; i < len; i++) {
                    this.push(classList[i]);
                }
                this._updateClassName = function() {
                    elem.setAttribute('class', this.toString());
                };
            };

            var classListProto = DOMTokenList[protoProp] = [];

            classListProto.item = function(i) {
                return this[i] || null;
            };

            classListProto.contains = function(token) {
                token += '';
                return arrIndexOf.call(this, token) !== -1;
            };

            classListProto.add = function() {
                var tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token,
                    updated = false;

                do {
                    token = tokens[i] + '';
                    if (arrIndexOf.call(this, token) === -1) {
                        this.push(token);
                        updated = true;
                    }
                } while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };

            classListProto.remove = function() {
                var tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token,
                    updated = false,
                    index;

                do {
                    token = tokens[i] + '';
                    index = arrIndexOf.call(this, token);
                    while (index !== -1) {
                        this.splice(index, 1);
                        updated = true;
                        index = arrIndexOf.call(this, token);
                    }
                } while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };

            classListProto.toggle = function(token, force) {
                token += '';

                var result = this.contains(token),
                    method = result ? force !== true && 'remove' : force !== false && 'add';

                if (method) {
                    this[method](token);
                }

                if (force === true || force === false) {
                    return force;
                } else {
                    return !result;
                }
            };

            classListProto.toString = function() {
                return this.join(' ');
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: function() {
                        return new DOMTokenList(this);
                    },
                    enumerable: true,
                    configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) {
                    if (ex.number === -0x7FF5EC54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            }
        }(window));
    }

    // ========================================
    // CustomEvent Polyfill (IE11)
    // ========================================
    if (typeof window.CustomEvent !== 'function') {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        window.CustomEvent = CustomEvent;
    }

    // ========================================
    // requestAnimationFrame Polyfill
    // ========================================
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                                        window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    // ========================================
    // Console Polyfill (구형 브라우저)
    // ========================================
    if (!window.console) {
        window.console = {
            log: function() {},
            warn: function() {},
            error: function() {},
            info: function() {},
            debug: function() {}
        };
    }

    // ========================================
    // window.location.origin Polyfill (IE11)
    // ========================================
    if (!window.location.origin) {
        window.location.origin = window.location.protocol + '//' + 
                                window.location.hostname + 
                                (window.location.port ? ':' + window.location.port : '');
    }

    // ========================================
    // Clipboard API Polyfill (구형 브라우저)
    // ========================================
    if (!navigator.clipboard) {
        navigator.clipboard = {
            writeText: function(text) {
                return new Promise(function(resolve, reject) {
                    var textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.top = '0';
                    textArea.style.left = '0';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    try {
                        var successful = document.execCommand('copy');
                        document.body.removeChild(textArea);
                        
                        if (successful) {
                            resolve();
                        } else {
                            reject(new Error('복사 실패'));
                        }
                    } catch (err) {
                        document.body.removeChild(textArea);
                        reject(err);
                    }
                });
            }
        };
    }

    console.log('[Polyfills] 브라우저 호환성 패치 로드 완료');
})();
