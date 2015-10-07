/**
 * @jsx React.DOM
 */

define([
  "react",
  "js/utils",
  "jquery",
  "js/components/generic/modal"
],function (
  React,
  Utils,
  $,
  Modal
) {
    'use strict';

    var GithubErrorHandler = {

        renderErrorPage : function(errorData){
            for(var resource in errorData){
                var data = errorData[resource];
                var remainingRequests = data.getResponseHeader('X-RateLimit-Remaining');
                var message = data.responseJSON.message;
                if (remainingRequests == 0){
                    return <div>
                        <p className="alert alert-danger">Rate limit exceeded: {message}</p>
                    </div>;
                }
                return <div><p className="alert alert-danger">The following error occurred when querying the Github API: {message}</p></div>;
            }
        }
    };

    return GithubErrorHandler;
});
