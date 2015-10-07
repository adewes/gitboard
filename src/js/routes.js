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
        "js/components/user/logout"
    ],
    function (
              Utils,
              SprintBoard,
              Milestones,
              Repositories,
              Organizations,
              Login,
              Logout
             )
    {

    var routes = {
        '' : 
            function(){return {
                data : {},
                component: Repositories}
            },
        '/sprintboard/:repositoryId/:milestoneId': 
            function(repositoryId,milestoneId){return {
                anonOk : true,
                data : {repositoryId : repositoryId,milestoneId : milestoneId},
                component: SprintBoard,
            }},
        '/repositories': 
            function(){return {
                data : {},
                component: Repositories
            }},
        '/repositories/:organizationId': 
            function(organizationId){return {
                data : {organizationId : organizationId},
                anonOk : true,
                component : Repositories
            }},
        '/user_repositories/:userId': 
            function(userId){return {
                data : {userId : userId},
                anonOk : true,
                component : Repositories
            }},
        '/organizations': 
            function(){return {
                data : {},
                component : Organizations
            }},
        '/milestones/:repositoryId': 
            function(repositoryId){return {
                anonOk : true,
                data : {repositoryId : repositoryId},
                component : Milestones
            }},
        '/login': 
            function(){return {
                data : {},
                anonOk: true,
                component : Login
            }},
        '/logout' : 
            function(){return {
                data : {},
                anonOk : true,
                component : Logout
            }},
      };

    return routes;
    });
