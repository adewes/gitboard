define([],function (settings) {
    'use strict';

    function Subject(){
        this.observers = [];
    }

    Subject.prototype = {
        subscribe : function (callback) {
        this.observers.push(callback);
        },
        unsubscribe : function(callback) {
            var new_observers = [];
            for (var i in this.observers)
            {
                if (this.observers[i] !== callback)
                    new_observers.push(this.observers[i]);
            }
            this.observers = new_observers;
        },
        notify : function(property,data) {
            var new_observers = [];
            this.observers.forEach(function (cb) {
                try {
                    cb(this,property,data);
                    new_observers.push(cb);
                }
                catch(e){throw e;
                }}.bind(this)
                );        
            this.observers = new_observers;
        }
    }

    return {
        Subject : Subject
        };
    });
