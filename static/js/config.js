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
var require ={
  paths: {
    "text" : "assets/js/text",
    "jquery" : "bower_components/jquery/dist/jquery",
    "bootstrap" : "bower_components/bootstrap/dist/js/bootstrap",
    "moment" : "bower_components/momentjs/moment",
    "director" : "bower_components/director/build/director",
    "react": "bower_components/react/react",
    "sprintf" :"bower_components/sprintf/src/sprintf",
    "markdown":"bower_components/markdown/lib/markdown",
    "marked" : "bower_components/marked/lib/marked",
  },
  shim : {
    "director" : {
        exports : 'Router'
    },
    "bootstrap" : {
        deps : ['jquery']
    },
    "prism" : {
        exports : 'Prism'
    },
    "marked" : {
        exports : 'marked',
    },
  },
baseUrl : "/static",
urlArgs: "bust=" + (new Date()).getTime()
};
