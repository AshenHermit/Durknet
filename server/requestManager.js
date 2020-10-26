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
    this.username = data.username
    this.password = data.password
    this.token = ""
}

function createUser(data, db){
    if(data.name.length == 0){
        return "Please, enter the name"
    }
    else if(data.username.length < 4){
        return "username length must be equal or greater than 4 characters"
    }
    else if(data.username.indexOf(" ") != -1 || data.username.indexOf("	") != -1){
        return "username cant contain tabs and spaces"
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

function registerUser(data, db){
    var newUser = createUser(data, db)

    if (typeof newUser == "object"){
        newUser.token = generateToken()
        db.users.push(newUser)
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

export default function(app, jsonParser, db){
    
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

    app.post("/save-db", jsonParser, (req, res)=>{
        if(!req.body) return res.sendStatus(400)

        var data = req.body
        var result = false

        if(data.password == "001011"){
            fs.writeFile('./local/db.json', JSON.stringify(db), 'utf8', function (err) {
                if(err){
                    return(console.log(err))
                }
                result = true;
                console.log("database saved")
                res.json({
                    message: result ? "successfully" : "error"
                })
            })
        }
    })
}