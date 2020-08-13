const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

let port = 3000;
for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if ((arg === '--port' || arg === '-p') && i < process.argv.length - 1) {
        port = parseInt(process.argv[++i]);
    }
}

const app = express();
app.use(express.static('.'));
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
app.get('/o3h.dev.txt', (req, res) => res.send('OK'));
app.listen(port, function () {
    console.log(`Listening on http://localhost:${port}/`);
});
