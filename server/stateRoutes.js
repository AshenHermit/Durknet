import ssr from './server'

export default function(app){
    
    function route(req, res){
        const response = ssr(req.url)
        res.send(response)
    }

    app.get("/", route)
    app.get("/my-products", route)
    app.get("/search", route)
}