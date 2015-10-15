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
            var errorMessages = [];
            for(var resource in errorData){
                var data = errorData[resource];
                var remainingRequests = data.getResponseHeader('X-RateLimit-Remaining');
                var githubMessage = data.responseJSON.message;
                if (remainingRequests == 0){
                    var message;
                    if (Utils.isLoggedIn())
                        message = <p>It seems that the rate limit is exceeded. Please wait a while before trying again.</p>;
                    else
                        message = <p>It seems that you have exceeded the rate limit of the Github API. You can increase that limit by logging in.<br /><A className="btn btn-md btn-success" href={Utils.makeUrl("/login")}>log in to increase rate limit</A></p>;

                    errorMessages.push(<div>
                        {message}
                    </div>);
                }
                else
                    errorMessages.push(<div><p className="alert alert-danger">The following error occurred when querying the Github API: {githubMessage}</p></div>);
                break;
            }
           return <div className="container">
                <div className="row">
                    <div className="col-md-4 col-md-offset-4">
                        <div className="well bs-component">
                            <h3>Oh no! An error occurred...</h3>
                            {errorMessages}
                        </div>
                   </div>
                </div>
            </div>;

        }
    };

    return GithubErrorHandler;
});
