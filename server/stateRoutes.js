import ssr from './server'

export default function(app){
    app.get("*", (req, res)=>{
        const response = ssr(req.url)
        res.send(response)
    })
}