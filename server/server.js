import React from 'react'
import {renderToString} from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import {Helmet} from 'react-helmet'

import App from '../src/app/App'
import template from './template'

export default function render(url){
    const reacrRouterContext = {}

    let content = renderToString(
        <StaticRouter location={url} context={reacrRouterContext}>
            <App/>
        </StaticRouter>
    )

    const helmet = Helmet.renderStatic()

    return template(helmet, content)
}
