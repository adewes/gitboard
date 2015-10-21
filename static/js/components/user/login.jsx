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
        "js/api/github/user",
        "js/components/mixins/form",
        "js/components/mixins/tabs",
        "js/flash_messages",
        "react"],function (
                    settings,
                    Utils,
                    AuthorizationApi,
                    UserApi,
                    FormMixin,
                    TabsMixin,
                    FlashMessagesService,
                    React
                ) {
    'use strict';

    var Login = React.createClass({

        displayName : 'Login',

        mixins : [TabsMixin],

        render : function(){

            var tabs = [
                {
                    name : 'password',
                    title : 'Password Login',
                    href  :  Utils.makeUrl(this.props.baseUrl,
                                           {tab:'password'},
                                           this.props.params),
                    content : <PasswordLogin params={this.props.params}
                                                baseUrl={this.props.baseUrl}
                                                data={this.props.data} />
                },
                {
                    name : 'accessToken',
                    title : 'Access Token Login',
                    href  :  Utils.makeUrl(this.props.baseUrl,
                                           {tab:'accessToken'},
                                           this.props.params),
                    content : <AccessTokenLogin params={this.props.params}
                                                baseUrl={this.props.baseUrl}
                                                data={this.props.data} />
                },
            ];

            this.setupTabs(tabs, 'password');

            return <div className="container">
                       <div className="row">
                           <div className="col-md-4 col-md-offset-4">
                               <div className="well bs-component">
                                   {this.getTabs()}
                                   <hr />
                                   {this.getCurrentTabContent()}
                               </div>
                           </div>
                       </div>
                   </div>;
        },

    });

    var AccessTokenLogin = React.createClass({

        displayName : 'AccessTokenLogin',

        mixins : [FormMixin,TabsMixin],

        fields: {
            accessToken: {
                required: true,
                requiredMessage: "Please enter a valid access token.",
            },
        },

        getInitialState: function () {
            return {accessToken : ''};
        },

        componentWillMount : function(){
            this.userApi = UserApi.getInstance();
        },

        render: function () {
            var params = Utils.makeUrlParameters(this.props.params);
            var spacerWidth = this.state.spacerWidth ? 'large' : 'thin';

            return <form className="form-horizontal" 
                 onSubmit={this.handleSubmit} 
                 roleName="form">
                    {this.formatErrorMessage()}
                    <fieldset>
                        {this.formatFieldError('accessToken')}
                        <input type="password" 
                               onChange={this.setter('accessToken')} 
                               id="accessToken" 
                               className="form-control" 
                               placeholder="Github Access Token" autofocus />
                        <button id="login-button" className="btn btn-success" type="submit"><span className="text">Log in</span> <span className="trigger"></span></button>
                    </fieldset>
                    <hr />
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <h5>Generating an access token</h5>
                        </div>
                        <div className="panel-body">
                            <ol className="list">
                                <li>Click <a target="_blank" href={"https://github.com/settings/tokens/new?"+Utils.makeUrlParameters({scopes : settings.scopes.join(','),description : 'Gitboard Access Token'})}>here</a> to go to your Github token settings.</li>
                                <li>Confirm the creation of the token. Scopes (we need <strong>read:org + repo</strong>) and description should already be correctly set.</li>
                                <li>Copy the token and paste it into the form above.</li>
                            </ol>
                        </div>
                    </div>
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <h5>Security Notice</h5>
                        </div>
                        <div className="panel-body">
                            <p>
                                Your access token will not be transmitted anywhere and will be kept in the session storage
                                of your browser for the duration of the session.
                            </p>
                        </div>
                    </div>
                </form>;
        },

        handleSubmit: function (e) {

            e.preventDefault();

            var formData = {accessToken : this.state.accessToken};

            if (!this.validate())
                return;

            var onSuccess = function(data){
                Utils.redirectTo("/");
            }.bind(this);

            var onError = function(){
                FlashMessagesService.postMessage({
                    type : "danger",
                    description : "Login failed, please check the access token that you've provided."
                });

            }.bind(this);

            console.log(formData.accessToken);

            Utils.login(formData.accessToken)
            this.userApi.getProfile(onSuccess,onError);

        },
    });

    var PasswordLogin = React.createClass({

        displayName: "PasswordLogin",

        mixins : [FormMixin,TabsMixin],

        fields: {
            login: {
                required: true,
                requiredMessage: "Please enter your username.",
            },
            password: {
                required: true,
                requiredMessage: "Please enter your password.",
                validator: function(value, name, data) {
                    if (!value || value.length < 8)
                        throw {message: "Password has to be at least 8 characters long."};
                },
            },
            opt : {
                required: false
            }
        },

        getInitialState: function () {
            return {login : '',
                    password: '',
                    accessToken : '',
                    otp : ''};
        },

        componentWillMount : function(){
            this.authorizationApi = AuthorizationApi.getInstance();
            if (Utils.isLoggedIn())
                Utils.redirectTo(Utils.makeUrl("/"));
        },

        render: function () {
            var params = Utils.makeUrlParameters(this.props.params);
            var spacerWidth = this.state.spacerWidth ? 'large' : 'thin';

            return <form className="form-horizontal" 
                 onSubmit={this.handleSubmit} 
                 roleName="form">
                    {this.formatErrorMessage()}
                    <fieldset>
                        {this.formatFieldError('login')}
                        <input type="login" 
                               onChange={this.setter('login')} 
                               id="login" 
                               className="form-control" 
                               placeholder="Github Login" autofocus />
                        {this.formatFieldError('password')}
                        <input type="password" onChange={this.setter('password')} id="password" className="form-control" placeholder="Password" />
                        {this.formatFieldError('otp')}
                        <input type="login" onChange={this.setter('otp')} id="otp" className="form-control" placeholder="One-Time-Password (if required)" />
                        <button id="login-button" className="btn btn-success" type="submit"><span className="text">Log in</span> <span className="trigger"></span></button>
                    </fieldset>
                    <hr />
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <h5>Security Notice</h5>
                        </div>
                        <div className="panel-body">
                            <p>
                                Your Github login & password is <strong>only</strong> used to create an authorization
                                through the Github API. The communication takes places <strong>directly
                                between you and Github</strong> and the information is <strong>not</strong> transmitted
                                anywhere else. Your username and password will <strong>not</strong> be stored in
                                the session storage or anywhere else in your browser. Only the 
                                generated access token will be kept in the session storage.
                            </p>
                            <p>
                                If you do not feel comfortable entering your Github credentials (and we do not blame you for it),
                                you can also log in by <strong>providing an <A href={Utils.makeUrl(this.props.baseUrl,{tab : 'accessToken'})}>access token</A></strong>.
                            </p>
                        </div>
                    </div>
                </form>;
        },

        handleSubmit: function (e) {

            e.preventDefault();

            var formData = {login : this.state.login,
                            password : this.state.password,
                            otp : this.state.otp};

            if (!this.validate())
                return;

            var onError = function(xhr,status,message){
                var otpHeader = xhr.getResponseHeader('X-Github-OTP');
                if (otpHeader !== null && otpHeader.match(/required/i))
                    this.addFieldError("otp","Please enter a valid one-time-password.");
                else
                    this.setErrorMessage("Wrong username or password. Please try again.");
            }.bind(this);

            var onSuccess = function(data){
                Utils.login(data.token);
                Utils.localStore("authorizationId",data.id);
                Utils.redirectTo(Utils.makeUrl("/"));
            }.bind(this);

            var description = 'Gitboard Access Token - '+navigator.userAgent;

            var createAuthorization = function(){
                this.authorizationApi.createAuthorization(formData.login,formData.password,formData.otp,{note : description,scopes : settings.scopes},onSuccess,onError)
            }.bind(this);

            var checkAuthorizations = function(authorizations){
                for(var i in authorizations){
                    var authorization = authorizations[i];
                    if (authorization.note == description){
                        //if we find an existing authorization, we delete it and create a new one
                        this.authorizationApi.deleteAuthorization(formData.login,formData.password,formData.otp,authorization.id,createAuthorization,onError);
                        return;
                    }
                }
                //if we didn't find any existing authorization with that exact description, we just create one
                createAuthorization();
            }.bind(this);

            this.authorizationApi.getAuthorizations(formData.login,formData.password,formData.otp,checkAuthorizations,onError);


        },

    });

    return Login;

});
