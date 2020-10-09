const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// commandline options
let root = '.';
let port = null;
let useHttps = false;
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
    if (arg === '--https' || arg === '-s') {
        useHttps = true;
    }
}
if (port == null) {
    port = useHttps ? 8443 : 3000;
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

if (useHttps) {
    try {
        const opt = {
            key: fs.readFileSync(path.join(__dirname, 'key.pem'), 'utf8'),
            cert: fs.readFileSync(path.join(__dirname, 'cert.pem'), 'utf8'),
            passphrase: process.env.HTTPS_PASSPHRASE || ''
        };
        https.createServer(opt, app).listen(port, () => {
            console.log(`Serving ${root} on https://localhost:${port}/`);
        });
    } catch {
        console.error(`Generate a certificate:
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365

Make it passphrase-less:
openssl rsa -in key.pem -out newkey.pem && mv newkey.pem key.pem
        `);
        process.exit(-1);
    }
} else {
    app.listen(port, () => {
        console.log(`Serving ${root} on http://localhost:${port}/`);
    });
}
