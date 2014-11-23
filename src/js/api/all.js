define(["js/api/github/authorization",
        "js/api/github/user",
        "js/api/github/issue",
        ],function (AuthorizationApi,
                    UserApi,
                    IssueApi
                    ) {
    'use strict';

    return {
        authorization : AuthorizationApi.getInstance(),
        user : UserApi.getInstance(),
        issue : IssueApi.getInstance(),
    };
});
