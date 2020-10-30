import React from 'react'
import {Switch, Route} from 'react-router'
import Home from './Home'

export default function App(){
    return(
        <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/my-products" component={Home}/>
            <Route exact path="/search" component={Home}/>
        </Switch>
    )
}