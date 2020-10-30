import { type } from "os";

var fetch = require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;

const fs = require("fs");

function generateToken(){
    var out = ""
    for(var i=0; i<3; i++){
        out += Math.random().toString(36).substr(2)
    }
    return out
}

function User(data){
    this.name = data.name
    this.username = data.username.toLowerCase()
    this.password = data.password
    this.token = ""
    this.products = []
}
//
function createUser(data, db){
    var cantContain = ["=", ";", ":", ",", "/", "="]
    if(data.name.length == 0){
        return "Please, enter the name"
    }
    else if(data.username.length < 4){
        return "username length must be equal or greater than 4 characters"
    }
    else if(new RegExp([" ", "	"].join("|")).test(data.username)){
        return "username cant contain tabs and spaces"
    }
    else if(new RegExp(cantContain.join("|")).test(data.username)){
        return "username cant contain " + cantContain.join(" ")
    }
    else if(data.password.length < 4){
        return "password length must be equal or greater than 4 characters"
    }
    else{
        for(var i=0; i<db.users.length; i+=1){
            if(data.username == db.users[i].username){
                return "account with this username already registered"
            }
        }
    }
    
    return new User(data)
}

function getUserByToken(token, db, getIndex=false){
    return db.users[getIndex ? "findIndex" : "find"](x => x.token == token)
}

function Product(data, userId){
    this.uid = -1
    this.title = data.title
    this.description = data.description
    this.tags = data.tags.toLowerCase().split(" ")
    this.image = data.imageUrl
    this.author = userId
}
function createProduct(data, userId){
    if(data.title.length == 0){
        return "Please, enter the title"
    }else if(data.tags.length > 100){
        return "too big tag data"
    }
    return new Product(data, userId)
}
function editProductObject(product, data){
    product.title = data.title
    product.description = data.description
    product.tags = data.tags.toLowerCase().split(" ")
    product.image = data.imageUrl
}

function registerUser(data, db){
    var newUser = createUser(data, db)

    if (typeof newUser == "object"){
        newUser.token = generateToken()
        db.users.push(newUser)
        saveDb(db, ()=>{}, ()=>{})
    }
    
    return newUser
}

function getUserAccount(data, db){
    for(var i=0; i<db.users.length; i+=1){
        if(data.username == db.users[i].username){
            if(data.password == db.users[i].password){
                db.users[i].token = generateToken()
                return db.users[i];
            }else{
                return "invalid password";
            }
        }
    }
    return "invalid username";
}

function userLogout(data, db){
    for(var i=0; i<db.users.length; i+=1){
        if(data.token == db.users[i].token){
            db.users[i].token = ""
            return true
        }
    }
    return null
}

function loadDb(data, callback, errorCallback){
    var dbx = new Dropbox({
        accessToken:  data.accessToken, 
        fetch: fetch
    });
    
    dbx.filesDownload({path: '/db.json'})
    .then(function(response) {
        var encoded = new Buffer.from(response.result.fileBinary);
        console.log("database loaded")
        callback(JSON.parse(encoded.toString('utf8')))
    })
    .catch(function(err){
        console.log(err)
        errorCallback()
    })
}

function saveDb(db, callback, errorCallback){
    var dbCopy = Object.assign({}, db)

    for(var i=0; i<dbCopy.users.length; i++){
        dbCopy.users[i].token = ""
    }

    /*
    fs.writeFile('./local/db.json', JSON.stringify(dbCopy, 0, 4), 'utf8', function (err) {
        if(err){
            errorCallback()
            return(console.log(err))
        }
        callback()
    })
    */
    var dbx = new Dropbox({
        accessToken:  process.env.DBX_ACCESS_TOKEN, 
        fetch: fetch
    });

    dbx.filesUpload({
        "path": "/db.json",
        "contents": JSON.stringify(dbCopy, 0, 4),
        "mode": {".tag": "overwrite"},
        "autorename": false,
        "mute": true,
        "strict_conflict": false
    }).then(function(req){
        callback()
    })
    .catch(function(err){
        console.log(err)
        errorCallback()
    })
}

function getProductByUid(uid, db, getIndex=false){
    return db.products[getIndex ? "findIndex" : "find"](x => x.uid == uid)
}

function editProduct(data, db){
    for(var u=0; u<db.users.length; u+=1){
        if(data.token == db.users[u].token){
            if(data.operation == "add"){
                var newProduct = createProduct(data, db.users[u].username)
                if(typeof newProduct == "string"){
                    return newProduct
                }else{
                    newProduct.uid = db.nextProductId
                    db.products.unshift(newProduct)
                    db.users[u].products.unshift(db.nextProductId)

                    db.nextProductId += 1
                }

            }else if(data.operation == "edit"){
                editProductObject(getProductByUid(data.productId, db), data)
            }else if(data.operation == "delete"){
                db.products.splice(getProductByUid(data.productId, db, true), 1)
                db.users[u].products.splice(db.users[u].products.findIndex(x => x == data.productId), 1)
            }else{
                return "invalid operation"
            }
            saveDb(db, ()=>{}, ()=>{})
            return false
        }
    }

    return "you have no rights for that"
}

function searchProducts(data, db){
    var list = []
    db.products.forEach(product => {
        var matches = true
        if(data.searchData.uid){
            matches = matches && data.searchData.uid == product.uid
        }
        if(data.searchData.author){
            matches = matches && new RegExp(data.searchData.author.toLowerCase()).test(product.author.toLowerCase())
        }
        if(data.searchData.tags){
            matches = matches && data.searchData.tags.split(" ").every(tag => product.tags.includes(tag))
        }
        if(data.searchData.title){
            matches = matches && new RegExp(data.searchData.title.toLowerCase()).test(product.title.toLowerCase())
        }
        if(data.searchData.description){
            matches = matches && new RegExp(data.searchData.description.toLowerCase()).test(product.description.toLowerCase())
        }

        if(matches){
            list.push(product)
        }
    })
    return list
}

export default function(app, jsonParser, db){
    
    loadDb({accessToken: process.env.DBX_ACCESS_TOKEN},
        // success
        (function(newDb){
            db = newDb
        }).bind(db),
        // error
        function(){
            console.log("error: unable to load database")
        }
    )
    
    app.post("/sign-up", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var user = registerUser(req.body, db)

        res.json({
            message: typeof user == "string" ? user : "signed in",
            token: typeof user == "string" ? "" : user.token,
            user_data: user
        })
    })

    app.post("/sign-in", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var user = getUserAccount(req.body, db)
        
        res.json({
            message: typeof user == "string" ? user : "signed in",
            token: typeof user == "string" ? "" : user.token,
            user_data: user
        })
    })

    app.post("/log-out", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var result = userLogout(req.body, db)
        
        res.json({
            message: result ? "successfully" : "error"
        })
    })

    app.post("/load-db", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var data = req.body
        
        if(getUserByToken(data.token, db).username == "ashen_hermit"){
            loadDb({accessToken: process.env.DBX_ACCESS_TOKEN},
                // success
                (function(newDb){
                    db = newDb
                    res.json({
                        message: "successfully"
                    })
                }).bind(db),
                // error
                function(){
                    res.json({
                        message: "error: unable to load database"
                    })
                }
            )
        }
    })
    app.post("/save-db", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var data = req.body
        
        if(getUserByToken(data.token, db).username == "ashen_hermit"){
            saveDb(db,
                // success
                function(){
                    res.json({
                        message: "successfully"
                    })
                },
                // error
                function(){
                    res.json({
                        message: "error: unable to save database"
                    })
                }
            )
        }
    })

    app.post("/edit-product", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var result = editProduct(req.body, db)
        
        res.json({
            message: !(result) ? "successfully" : result
        })
    })
    
    app.post("/get-products-list", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var data = req.body

        var result = []
        for(var i=data.offset; i<Math.min(data.offset+data.count, db.products.length); i++){
            result.push(db.products[i])
        }
        
        res.json({
            list: result
        })
    })

    app.post("/get-my-products-list", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var data = req.body
        var result = []
        var mes = "error"
        for(var u=0; u<db.users.length; u+=1){
            if(data.token == db.users[u].token){
                for(var i=data.offset; i<Math.min(data.offset+data.count, db.users[u].products.length); i++){
                    result.push(getProductByUid(db.users[u].products[i], db))
                }
                mes = "successfully"
            }
        }
        
        res.json({
            message: mes,
            list: result
        })
    })

    app.post("/get-products-list-with-search", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var data = req.body
        var result = searchProducts(data, db)
        
        res.json({
            list: result
        })
    })
}