/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

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

            return <form className="col-xs-8 col-xs-offset-2" 
                         onSubmit={this.handleSubmit} 
                         roleName="form">
                        {this.formatErrorMessage()}
                        {this.formatFieldError('login')}
                        <input type="login" onChange={this.setLogin} id="login" className="form-control" placeholder="Github Login" autofocus />
                        {this.formatFieldError('password')}
                        <input type="password" onChange={this.setPassword} id="password" className="form-control" placeholder="Password" />
                        {this.formatFieldError('otp')}
                        <input type="login" onChange={this.setOtp} id="otp" className="form-control" placeholder="One-Time-Password" />
                        <button id="login-button" className="btn btn-c2a btn-block arrow" type="submit"><span className="text">Log in</span> <span className="trigger"></span></button>
                      </form>;
        },

        handleSubmit: function (e) {

            var formData = {login : this.state.login,password : this.state.password,otp : this.state.otp};

            var onSuccess = function(data){
                for(var i in data){
                    var token = data[i];
                    if (token.note == 'gitboard'){
                        Utils.login(token.token);
                        Utils.redirectTo("#/");
                        return;
                    }
                }

                var onSuccess = function(data){
                    Utils.login(data.token);
                    Utils.redirectTo("#/");
                }.bind(this);

                var onError = function(xhr,status,message){
                }.bind(this);
                this.authorizationApi.createAuthorization(formData.login,formData.password,formData.otp,{note : 'gitboard',scopes : ['repo','read:org']},onSuccess,onError)
            }.bind(this);

            var onError = function(xhr,status,message){
                var otpHeader = xhr.getResponseHeader('X-Github-OTP');
                if (otpHeader !== null && otpHeader.match(/required/i))
                    console.log("one-time-password required!");
            }.bind(this);

            this.authorizationApi.getAuthorizations(formData.login,formData.password,formData.otp,onSuccess,onError);

            e.preventDefault();
        },  

    });

    return Login;

});
