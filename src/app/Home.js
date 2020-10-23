import React from 'react'
import {Helmet} from 'react-helmet'

export default function Home(){
    return (
        <div>
            <Helmet>
                <title>Home page</title>
                <meta name="description" content="Modern Web App"/>
            </Helmet>
            <h1>
                Welcome to Durknet
            </h1>
        </div>
    )
}