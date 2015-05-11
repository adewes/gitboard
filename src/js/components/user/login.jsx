/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

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

define(["js/settings",
        "js/utils",
        "js/api/github/authorization",
        "js/components/mixins/form",
        "js/flash_messages",
        "react"],function (
                    settings,
                    Utils,
                    AuthorizationApi,
                    FormMixin,
                    FlashMessagesService,
                    React
                ) {
    'use strict';

    var Login = React.createClass({

        displayName: "LoginComponent",

        mixins : [FormMixin],

        setPassword: function(e){
            this.setState({password : e.target.value});
        },

        setLogin: function(e){
            this.setState({login : e.target.value});
        },

        setOtp: function(e){
            this.setState({otp : e.target.value});
        },

        getInitialState: function () {
            return {login : '',password: '', accessToken : '',otp : ''};
        },

        componentWillMount : function(){
            this.authorizationApi = AuthorizationApi.getInstance();
        },

        growSpacer : function() {
            this.setState({spacerWidth: !this.state.spacerWidth});
        },

        render: function () {
            var params = Utils.makeUrlParameters(this.props.params);
            var spacerWidth = this.state.spacerWidth ? 'large' : 'thin';

            return <div className="container">
                        <div className="row">
                            &nbsp;
                        </div>
                        <div className="row">
                            <div className="col-xs-4 col-xs-offset-4">
                                <div className="well bs-component">
                                    <form className="form-horizontal" 
                                     onSubmit={this.handleSubmit} 
                                     roleName="form">
                                        {this.formatErrorMessage()}
                                        {this.formatFieldError('login')}
                                        <fieldset>
                                            <input type="login" 
                                                   onChange={this.setLogin} 
                                                   id="login" 
                                                   className="form-control" 
                                                   placeholder="Github Login" autofocus />
                                            {this.formatFieldError('password')}
                                            <input type="password" onChange={this.setPassword} id="password" className="form-control" placeholder="Password" />
                                            {this.formatFieldError('otp')}
                                            <input type="login" onChange={this.setOtp} id="otp" className="form-control" placeholder="One-Time-Password (if required)" />
                                            <button id="login-button" className="btn btn-primary" type="submit"><span className="text">Log in</span> <span className="trigger"></span></button>
                                        </fieldset>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
        },

        handleSubmit: function (e) {

            e.preventDefault();

            var formData = {login : this.state.login,password : this.state.password,otp : this.state.otp};

            if (!this.validate())
                return;

            var onSuccess = function(data){
                var existingAuthorization;
                for(var i in data){
                    var authorization = data[i];
                    if (authorization.note == 'gitboard'){
                        existingAuthorization = authorization;
                        break;
                        console.log(token);
                        Utils.login(token.token);
                        Utils.redirectTo("#/");
                        return;
                    }
                }

                var createAuthorization = function(){

                    var onSuccess = function(data){
                        Utils.login(data.token);
                        Utils.redirectTo("#/");
                    }.bind(this);

                    var onError = function(xhr,status,message){
                        this.setErrorMessage("The login failed for an unknown reason. Sorry :/");
                    }.bind(this);

                    this.authorizationApi.createAuthorization(formData.login,formData.password,formData.otp,{note : 'gitboard',scopes : ['repo','read:org']},onSuccess,onError)


                }.bind(this);

                if (existingAuthorization){
                    var onDeleteSuccess = function(){
                        createAuthorization();
                    }.bind(this);
                    var onDeleteError = function(){
                        this.setErrorMessage("Cannot delete existing authorization from Github. Sorry :/");
                    }
                    this.authorizationApi.deleteAuthorization(formData.login,formData.password,formData.otp,existingAuthorization.id,onDeleteSuccess,onDeleteError)

                }
                else
                    createAuthorization();
            }.bind(this);

            var onError = function(xhr,status,message){
                var otpHeader = xhr.getResponseHeader('X-Github-OTP');
                if (otpHeader !== null && otpHeader.match(/required/i))
                    this.addFieldError("otp","Please enter a valid one-time-password.");
                else
                    this.setErrorMessage("Wrong username or password. Please try again.");
            }.bind(this);

            this.authorizationApi.getAuthorizations(formData.login,formData.password,formData.otp,onSuccess,onError);

        },

    });

    return Login;

});
