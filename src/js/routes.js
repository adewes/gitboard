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
