import React from 'react'
import {Helmet} from 'react-helmet'

function sendRequest(address, data, callback){
    let request = new XMLHttpRequest();
    // посылаем запрос
    request.open("POST", address, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function(){
        callback(JSON.parse(request.response))
    })
    request.send(JSON.stringify(data))
}

class SignUpForm extends React.Component{
    constructor(props){
        super(props)
        this.onDoneClick = this.onDoneClick.bind(this)
    }

    onDoneClick(){
        let user = {
            name: document.getElementById("form_signup_name").value, 
            username: document.getElementById("form_signup_username").value,
            password: document.getElementById("form_signup_password").value
        };
        
        sendRequest(
            "/sign-up",
            user,
            (function (response) {
                console.log(response)
                if(response.token!=""){
                    window.userToken = response.token
                    window.userData = response.user_data
                    this.props.home.setState({
                        signUpForm: false, 
                        userSignedIn: true,
                        userData: window.userData})
                }else{
                    alert(response.message)
                }
            }).bind(this)
        )
    }
    render(){
        return (
            <div className="screen-form">
                <div className="screen-form-title">Sign Up</div>
                <div className="label">your full name:</div>
                <input className="input" name="username" id="form_signup_name" placeholder="name"></input>
                <div className="label">username:</div>
                <input className="input" name="username" id="form_signup_username" placeholder="username"></input>
                <div className="label">password:</div>
                <input className="input" name="password" type="password" id="form_signup_password" placeholder="password"></input>
                <button className="button form-button" onClick={this.onDoneClick}>register</button>
            </div>
        )
    }
}
class SignInForm extends React.Component{
    constructor(props){
        super(props)
        this.onDoneClick = this.onDoneClick.bind(this)
    }
    
    onDoneClick(){
        let user = {
            username: document.getElementById("form_signin_username").value,
            password: document.getElementById("form_signin_password").value
        };

        sendRequest(
            "/sign-in",
            user,
            (function (response) {
                console.log(response)
                if(response.token!=""){
                    window.userToken = response.token
                    window.userData = response.user_data
                    this.props.home.setState({
                        signInForm: false,
                        userSignedIn: true,
                        userData: window.userData})
                }else{
                    alert(response.message)
                }
            }).bind(this)
        )
    }
    render(){
        return (
            <div className="screen-form">
                <div className="screen-form-title">Sign In</div>
                <div className="label">username:</div>
                <input className="input" name="username" id="form_signin_username" placeholder="username"></input>
                <div className="label">password:</div>
                <input className="input" name="password" type="password" id="form_signin_password" placeholder="password"></input>
                <button className="button form-button" onClick={this.onDoneClick}>register</button>
            </div>
        )
    }
}

class Home extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            signUpForm: false,
            signInForm: false,
            userSignedIn: false,
            userData: {}
        }

        this.onScreenMouseDown = this.onScreenMouseDown.bind(this)
        this.logOut = this.logOut.bind(this)
    }

    onScreenMouseDown(e){
        if(e.target.className == "screen-form-container"){
            this.setState({signUpForm:false, signInForm:false})
        }
    }

    logOut(){
        var data = {token: window.userToken}
        
        sendRequest(
            "/log-out",
            data,
            (function (response) {
                if(response.message == "successfully"){
                    this.setState({userData:{}, userSignedIn:false})
                    window.userToken = ""
                }else{
                    alert(response.message)
                }
            }).bind(this)
        )
    }

    render(){
        return (
            <div>
                <Helmet>
                    <title>Home page</title>
                    <meta name="description" content="Modern Web App"/>
                </Helmet>

                <div className="page-block header">
                    <div className="header-item">
                        Shop
                    </div>
                    {this.state.userSignedIn ? 
                        [
                        <div>
                            <div className="header-item">{this.state.userData.name}</div>
                            <button className="header-item button" onClick={this.logOut}>Log out</button>
                        </div>
                        ]
                        
                    :
                        
                        [
                        <button className="header-item button outline" onClick={(e)=>{this.setState({signInForm:true})}}>Sign In</button>,
                        <button className="header-item button" onClick={(e)=>{this.setState({signUpForm:true})}}>Sign Up</button>
                        ]
                    }
                </div>
                <div className="page-block content"></div>
                <div className="page-block footer"></div>

                {(this.state.signUpForm || this.state.signInForm) ? 
                <div className="screen-form-container" onMouseDown={this.onScreenMouseDown}>
                    {this.state.signUpForm ? <SignUpForm home={this}/> : ''}
                    {this.state.signInForm ? <SignInForm home={this}/> : ''}
                </div>
                : ''}
                
                <h1>
                    Welcome to Durknet
                    
                </h1>
            </div>
        )
    }
}

export default Home;