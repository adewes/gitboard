define(["js/utils","js/subject"],function (Utils,Subject) {
    'use strict';

    var FlashMessages = function(){
        Subject.Subject.call(this);
        this.currentMessages = {};
        this.messageStream = [];
        this.messageCount = 0;
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new FlashMessages();
        return instance;
    }

    FlashMessages.prototype = new Subject.Subject();
    FlashMessages.prototype.constructor = FlashMessages;

    FlashMessages.prototype.postMessage = function(data){
        var messageId = this.messageCount;
        this.messageCount++;
        var messageData = {id: messageId,data : data,receivedAt : new Date()};
        if (messageData.duration === undefined)
            messageData.duration = 2500;
        this.currentMessages[messageId] = messageData;
        this.messageStream.push(messageId);
        this.notify("newMessage",messageData);
        return messageId;
    }

    return {getInstance:getInstance};

});
