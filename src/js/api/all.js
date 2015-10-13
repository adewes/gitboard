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
define(["js/api/github/authorization",
        "js/api/github/user",
        "js/api/github/issue",
        "js/api/github/repository",
        "js/api/github/milestone",
        "js/api/github/organization",
        "js/api/github/label",
        ],function (AuthorizationApi,
                    UserApi,
                    IssueApi,
                    RepositoryApi,
                    MilestoneApi,
                    OrganizationApi,
                    LabelApi
                    ) {
    'use strict';

    return {
        authorization : AuthorizationApi.getInstance(),
        user : UserApi.getInstance(),
        issue : IssueApi.getInstance(),
        repository : RepositoryApi.getInstance(),
        milestone : MilestoneApi.getInstance(),
        organization : OrganizationApi.getInstance(),
        label : LabelApi.getInstance()
    };
});
