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

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function getSearchData(){
    var path = window.location.href.substring(window.location.href.lastIndexOf("/"))
    var sData = {}
    var params = decodeURIComponent(path.substring(path.indexOf("#")+1)).split(";")
    for (var i=0; i<params.length; i++){
        var parts = params[i].split("=")
        sData[parts[0]] = parts[1]
    }
    return sData
}
function getSearchLink(data){
    var keys = Object.keys(data)
    var params = ""
    keys.forEach(key => {
        if(data[key]!="") params += key + "=" + data[key] + ";"
    })

    return "/search#" + encodeURIComponent(params)
}
function setSearchData(data){
    window.location.href = window.location.origin + getSearchLink(data)
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

                    setCookie("username", user.username, 40)
                    setCookie("password", user.password, 40)
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
                <input className="input" name="durknet_name" id="form_signup_name" placeholder="name"></input>
                <div className="label">username:</div>
                <input className="input" name="durknet_username" id="form_signup_username" placeholder="username"></input>
                <div className="label">password:</div>
                <input className="input" name="durknet_password" type="password" id="form_signup_password" placeholder="password"></input>
                <button className="button form-button" onClick={this.onDoneClick}>Sign up</button>
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

                    setCookie("username", user.username, 40)
                    setCookie("password", user.password, 40)
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
                <input className="input" name="durknet_username" id="form_signin_username" placeholder="username"></input>
                <div className="label">password:</div>
                <input className="input" name="durknet_password" type="password" id="form_signin_password" placeholder="password"></input>
                <button className="button form-button" onClick={this.onDoneClick}>Sign in</button>
            </div>
        )
    }
}

class EditProductForm extends React.Component{
    constructor(props){
        super(props)

        this.state={
            imageUrl: ""
        }

        this.onDoneClick = this.onDoneClick.bind(this)
        this.onDeleteClick = this.onDeleteClick.bind(this)
        this.onUrlPaste = this.onUrlPaste.bind(this)
        this.editRequest = this.editRequest.bind(this)
    }
    
    onDoneClick(){
        if (this.props.home.state.inEditMode && window.editProduct){
            this.editRequest("edit")
        }else{
            this.editRequest("add")
        }
    }
    onDeleteClick(){
        this.editRequest("delete")
        window.editProduct = null
    }

    editRequest(operation){
        var data = {
            productId: this.props.home.state.editProductId,
            token: userToken, 
            operation: operation,
            title: document.getElementById("form_edit_product_title").value,
            description: document.getElementById("form_edit_product_description").value,
            tags: document.getElementById("form_edit_product_tags").value,
            imageUrl: document.getElementById("form_edit_product_image_url").value,
        }

        sendRequest(
            "/edit-product",
            data,
            (function (response) {
                if(response.message == "successfully"){
                    this.props.home.setState({editProductForm: false})
                    this.props.home.updateProducts()
                }else{
                    alert(response.message)
                }
            }).bind(this)
        )
    }

    componentDidMount(){
        if(this.props.home.state.inEditMode && window.editProduct){
            document.getElementById("form_edit_product_title").value = window.editProduct.title
            document.getElementById("form_edit_product_description").value = window.editProduct.description
            document.getElementById("form_edit_product_tags").value = window.editProduct.tags.join(" ")
            document.getElementById("form_edit_product_image_url").value = window.editProduct.image
            this.setState({imageUrl: window.editProduct.image})
        }
    }

    onUrlPaste(e){
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        this.setState({imageUrl: paste})
    }

    render(){
        return (
            <div className="screen-form">
                <div className="screen-form-title">Add Product</div>
                <div className="label">title:</div>
                <input className="input" name="durknet-product-title" id="form_edit_product_title" placeholder="title" autoComplete="off"></input>
                <div className="label">description:</div>
                <input className="input" name="durknet-product-description" id="form_edit_product_description" placeholder="description" autoComplete="off"></input>
                <div className="label">tags:</div>
                <input className="input" name="durknet-product-tags" id="form_edit_product_tags" placeholder="tag_1 tag_2 ..." autoComplete="off"></input>
                <div className="label">image url:</div>
                <input className="input" name="durknet-product-image-url" id="form_edit_product_image_url" placeholder="image url" onPaste={this.onUrlPaste} autoComplete="off"></input>
                <img className="product-edit-image" src={this.state.imageUrl}/>
                <button className="button form-button" onClick={this.onDoneClick}>Done</button>
                {
                    this.props.home.state.inEditMode ?
                    <button className="button form-button" onClick={this.onDeleteClick}>Delete</button>
                    : ''
                }
            </div>
        )
    }
}

class Product extends React.Component{
    constructor(props){
        super(props)
        this.onEditClick = this.onEditClick.bind(this)
    }

    onEditClick(){
        window.editProduct = this.props.product
        this.props.home.setState({editProductId: this.props.product.uid, editProductForm: true})
    }

    render(){
        return (
            <div className="product">
                <a href={getSearchLink({uid: this.props.product.uid})} className="title">{this.props.product.title}</a>
                <div className="description">{this.props.product.description}</div>
                <img className="image" src={this.props.product.image}/>
                <div className="tag-container">
                { this.props.product.tags.map((tag) => 
                    <a href={getSearchLink({tags: tag})} className="tag">{tag}</a>
                ) }
                </div>
                <a href={getSearchLink({author: this.props.product.author})} className="author">{this.props.product.author}</a>
                {
                    this.props.home.state.inEditMode ?
                    <button className="button form-button" onClick={this.onEditClick}>edit</button>
                    : ''
                }
            </div>
        )
    }
}

class SearchForm extends React.Component{
    constructor(props){
        super(props)
        this.onSearchClick = this.onSearchClick.bind(this)
    }
    
    onSearchClick(){
        var data = {
            title: document.getElementById("form_search_title").value,
            description: document.getElementById("form_search_description").value,
            tags: document.getElementById("form_search_tags").value,
            author: document.getElementById("form_search_author").value,
        }

        setSearchData(data)

        this.props.home.updateProducts()
    }

    componentDidMount(){
        var data = getSearchData()
        if(data.title) document.getElementById("form_search_title").value = data.title
        if(data.description) document.getElementById("form_search_description").value = data.description
        if(data.tags) document.getElementById("form_search_tags").value = data.tags
        if(data.author) document.getElementById("form_search_author").value = data.author
    }

    render(){
        return (
            <div className="screen-form">
                <div className="screen-form-title">Search</div>
                <div className="label">fields may stay blank</div>
                <br/>
                <div className="label">title:</div>
                <input className="input" name="durknet-product-title" id="form_search_title" placeholder="title" autoComplete="off"></input>
                <div className="label">description:</div>
                <input className="input" name="durknet-product-description" id="form_search_description" placeholder="description" autoComplete="off"></input>
                <div className="label">tags:</div>
                <input className="input" name="durknet-product-tags" id="form_search_tags" placeholder="tag_1 tag_2 ..." autoComplete="off"></input>
                <div className="label">author</div>
                <input className="input" name="durknet-product-tags" id="form_search_author" placeholder="author" autoComplete="off"></input>
                <button className="button form-button" onClick={this.onSearchClick}>Search</button>
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
            editProductForm: false,
            searchForm: false,
            userSignedIn: false,
            userData: {},
            products: [],
            inEditMode: false,
            editProductId: -1
        }

        this.onScreenMouseDown = this.onScreenMouseDown.bind(this)
        this.logOut = this.logOut.bind(this)
        this.addProduct = this.addProduct.bind(this)
    }

    onScreenMouseDown(e){
        if(e.target.className == "screen-form-container"){
            this.setState({signUpForm:false, signInForm:false, editProductForm:false, searchForm:false})
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

    updateProducts(){
        var path = window.location.href.substring(window.location.href.lastIndexOf("/"))
        var data = {token: window.userToken, offset:0, count: 9999999}
        if (path=="/my-products"){
            data.token = window.userToken
            sendRequest(
                "/get-my-products-list",
                data,
                (function (response) {
                    if(response.message == "successfully"){
                        this.setState({inEditMode: true, products: response.list})
                    }
                }).bind(this)
            )
        }else{
            this.setState({inEditMode: false})
        }
        if (path=="/"){
            sendRequest(
                "/get-products-list",
                data,
                (function (response) {
                    this.setState({products: response.list})
                }).bind(this)
            )
        }else if (path.indexOf("/search") == 0){
            data.searchData = getSearchData()
            sendRequest(
                "/get-products-list-with-search",
                data,
                (function (response) {
                    this.setState({products: response.list})
                }).bind(this)
            )
        }
    }

    addProduct(){
        this.setState({editProductId: -1, editProductForm: true})
    }

    componentDidMount(){
        window.sendRequest = sendRequest

        // loading products
        this.updateProducts()

        window.addEventListener('hashchange', (function() {
            this.updateProducts()
        }).bind(this));

        // sign in
        if(getCookie("username")){
            let user = {
                username: getCookie("username"),
                password: getCookie("password")
            }
            
            sendRequest(
                "/sign-in",
                user,
                (function (response) {
                    console.log(response)
                    if(response.token!=""){
                        window.userToken = response.token
                        window.userData = response.user_data
                        this.setState({userSignedIn: true, userData: window.userData})
                        this.updateProducts()
                    }else{
                        console.error("an attempt to sign in with data from cookies: " + response.message)
                    }
                    
                }).bind(this)
            )
        }
    }

    render(){
        return (
            <div>
                <Helmet>
                    <title>Durknet</title>
                    <meta name="description" content="Modern Web App"/>
                </Helmet>

                <div className="page-block header">
                    <div className="header-item">
                        <a href="/"><div className="title">Durknet</div></a>
                        <button className="header-item button" onClick={(e)=>{this.setState({searchForm:true})}}>Search</button>
                    </div>
                    {this.state.userSignedIn ? 
                        [
                        <div className="header-item">
                            <div className="header-item">{this.state.userData.name}</div>
                            <button className="header-item button" onClick={this.logOut}>Log out</button>
                            <button className="header-item button" onClick={this.addProduct}>Add Product</button>
                            <a href="my-products"><button className="header-item button">My Products</button></a>
                        </div>
                        ]
                        
                    :
                        
                        [
                        <div className="header-item">
                            <button className="header-item button outline" onClick={(e)=>{this.setState({signInForm:true})}}>Sign In</button>
                            <button className="header-item button" onClick={(e)=>{this.setState({signUpForm:true})}}>Sign Up</button>
                        </div>
                        ]
                    }
                </div>
                <div className="page-block content"></div>
                <div className="page-block footer"></div>

                {(this.state.signUpForm || this.state.signInForm || this.state.editProductForm || this.state.searchForm) ? 
                <div className="screen-form-container" onMouseDown={this.onScreenMouseDown}>
                    {this.state.signUpForm ? <SignUpForm home={this}/> : ''}
                    {this.state.signInForm ? <SignInForm home={this}/> : ''}
                    {this.state.editProductForm ? <EditProductForm home={this}/> : ''}
                    {this.state.searchForm ? <SearchForm home={this}/> : ''}
                </div>
                : ''}
                
                <div className="products-container">
                {
                    this.state.products.map((product) =>
                        <Product 
                            key={product.uid.toString()} 
                            product={product}
                            home={this}/>
                    )
                }
                </div>
            </div>
        )
    }
}

export default Home;