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
define(
    [
        "js/utils",
        "js/components/sprintboard",
        "js/components/milestones",
        "js/components/repositories",
        "js/components/organizations",
        "js/components/user/login",
    ],
    function (
              Utils,
              SprintBoard,
              Milestones,
              Repositories,
              Organizations,
              Login
             )
    {

    var routes = {
        '' : 
            function(){
                return {
                    screen : 'index',data : {},
                    component: Repositories}
            },
        '/sprintboard/:repositoryId/:milestoneId': 
            function(repositoryId,milestoneId){return {screen : 'sprintboard',anonOk : true,
                data : {repositoryId : repositoryId,milestoneId : milestoneId},
                component: SprintBoard,
            }},
        '/repositories': 
            function(){return {screen : 'repositories',
                data : {},
                component: Repositories
            }},
        '/repositories/:organizationId': 
            function(organizationId){return {screen : 'repositories',
                data : {organizationId : organizationId},
                component : Repositories
            }},
        '/organizations': 
            function(){return {screen : 'organizations',
                data : {},
                component : Organizations
            }},
        '/milestones/:repositoryId': 
            function(repositoryId){return {screen : 'milestones',anonOk : true,
                data : {repositoryId : repositoryId},
                component : Milestones
            }},
        '/login': 
            function(){return {screen : 'login',
                data : {},
                component : Login
            }},
        '/logout' : 
            function(){return {screen : 'logout',
                data : {},
                component : Login
            }},
      };

    return routes;
    });
