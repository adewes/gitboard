/*
Copyright (c) 2015 - Andreas Dewes

This file is part of Gitboard.

Gitboard is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
