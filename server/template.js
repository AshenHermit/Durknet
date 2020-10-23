export default function template(helmet, content = ''){
    const scripts = `<script src="/client.js"></script>`

    const page = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#810051">
        <link rel="shortcut icon" href="/assets/logos/favicon.ico" type="image/x-icon">
        <link rel="icon" href="/assets/logos/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="/assets/global.css">
        </head>
        <body>
        <div class="content">
            <div id="app" class="wrap-inner">
                <!--- content -->
                ${content}
            </div>
        </div>
        ${scripts}
        </body>
    `
    
    return page
}