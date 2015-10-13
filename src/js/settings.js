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
define(["jquery","js/env_settings"],function ($,envSettings,Utils) {
    'use strict';

    var settings = {
        scopes: ['read:org'],
        source : 'https://api.github.com',
        useCache : true,
        cacheValidity : 3600*24, //cache expires after 24 hours
        cacheRefreshLimit  : 0.0, //how long until we fetch the new value of something?
    };
    return $.extend($.extend({},settings),envSettings);
})
