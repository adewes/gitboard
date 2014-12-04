define(["js/api/github/authorization",
        "js/api/github/user",
        "js/api/github/issue",
        "js/api/github/repository",
        "js/api/github/milestone",
        "js/api/github/organization",
        ],function (AuthorizationApi,
                    UserApi,
                    IssueApi,
                    RepositoryApi,
                    MilestoneApi,
                    OrganizationApi
                    ) {
    'use strict';

    return {
        authorization : AuthorizationApi.getInstance(),
        user : UserApi.getInstance(),
        issue : IssueApi.getInstance(),
        repository : RepositoryApi.getInstance(),
        milestone : MilestoneApi.getInstance(),
        organization : OrganizationApi.getInstance()
    };
});
