const fs = require('fs');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// commandline options
let root = '.';
let port = 3000;
let useApiProxy = true;
let caseSensitive = true;
for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if ((arg === '--port' || arg === '-p') && i < process.argv.length - 1) {
        port = parseInt(process.argv[++i]);
    }
    if ((arg === '--root' || arg === '-r') && i < process.argv.length - 1) {
        root = process.argv[++i];
    }
    if (arg === '--no-proxy-api' || arg === '-A') {
        useApiProxy = false;
    }
    if (arg === '--no-case-sensitive' || arg === '-C') {
        caseSensitive = false;
    }
}

root = path.resolve(root);
const app = express();
if (useApiProxy) {
    app.use('/api/', createProxyMiddleware({
            target: 'http://www.oooh.tv/',
            changeOrigin: true,
            autoRewrite: true,
            followRedirects: true,
            onProxyRes: (proxyRes, req, res) => {
                if (req.url.endsWith('/o3h.js')) {
                    res.setHeader('Content-Type', 'text/javascript');
                    res.write('const LOCAL_DEVELOPMENT = true; //');
                }
            }
        }
    ));
}
if (caseSensitive) {
    app.use((req, res, next) => {
        const absPath = path.resolve(root, './' + req.path);
        if (!fs.existsSync(absPath)) {
            // if the file does not exist, handle the 404 normally
            next();
            return;
        }
        const pathParts = path.parse(absPath);
        const isExactCase = fs.readdirSync(pathParts.dir).some(file => file === pathParts.base);
        if (isExactCase) {
            next();
        } else {
            res.status(404)
               .send(`Cannot ${req.method} ${req.path}, please check the cAsE Of YouR FILenAMe.`);
        }
    });
}
app.use(express.static(root));
app.get('/o3h.dev.txt', (req, res) => res.send('OK'));
app.listen(port, function () {
    console.log(`Serving ${root} on http://localhost:${port}/`);
});
