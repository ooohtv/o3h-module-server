const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

// commandline options --------------------------------
let root = '.';
let port = null;
let useHttps = false;
let apiRoot = null;
let caseSensitive = true;
for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if ((arg === '--port' || arg === '-p') && i < process.argv.length - 1) {
    port = parseInt(process.argv[++i]);
  }
  if ((arg === '--root' || arg === '-r') && i < process.argv.length - 1) {
    root = process.argv[++i].trim();
  }
  if (arg === '--api' || arg === '-a') {
    apiRoot = path.resolve(process.argv[++i].trim());
  }
  if (arg === '--no-case-sensitive' || arg === '-C') {
    caseSensitive = false;
  }
  if (arg === '--https' || arg === '-s') {
    useHttps = true;
  }
  if (arg === '--help' || arg === '-h') {
    console.log(fs.readFileSync(__dirname + '/README.md', 'utf-8'));
    process.exit(0);
  }
}
if (port == null) {
  port = useHttps ? 8443 : 3000;
}

// Decide how to proxy o3h.js -----------------------------
root = path.resolve(root);
const app = express();
if (!apiRoot) {
  app.use(
    '/api/',
    createProxyMiddleware({
      target: 'https://module.oooh.io/',
      changeOrigin: true,
      autoRewrite: true,
      followRedirects: true,
      selfHandleResponse: true,
      onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        let response;
        if (req.url.endsWith('/o3h.js')) {
          response = 'const LOCAL_DEVELOPMENT = true; //';
        }
        response += responseBuffer.toString('utf8');
        return response;
      }),
    })
  );
} else {
  app.get('/api/o3h.js', (req, res, next) => {
    let filePath = path.join(apiRoot, 'o3h.js');
    if (!fs.existsSync(filePath)) {
      return next();
    }
    const str = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/javascript');
    res.write(
      str.replace(
        /const\s+LOCAL_DEVELOPMENT\s*=\s*false;?/,
        'const LOCAL_DEVELOPMENT = true; // inserted by o3h-module-server'
      )
    );
    res.end();
  });
  app.get('/api/o3hLoader.js', (req, res, next) => {
    res.setHeader('Content-Type', 'text/javascript');
    res.write(`export default (async () => await import("./o3h.js"))()`);
    res.end();
  });
}

// Case sensitivity -----------------------------
if (caseSensitive) {
  app.use((req, res, next) => {
    const absPath = path.resolve(root, './' + req.path);
    if (!fs.existsSync(absPath)) {
      // if the file does not exist, handle the 404 normally
      return next();
    }
    const pathParts = path.parse(absPath);
    const isExactCase = fs.readdirSync(pathParts.dir).some((file) => file === pathParts.base);
    if (isExactCase) {
      next();
    } else {
      res.status(404).send(`Cannot ${req.method} ${req.path}, please check the cAsE Of YouR FILenAMe.`);
    }
  });
}

// Core serving ----------------------------
if (useHttps) {
  // add HTTPS-only headers
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
  });
}
app.use(
  express.static(root, {
    etag: false,
    maxAge: 0,
    lastModified: false,
    immutable: false,
  })
);
// Possible future alternative to LOCAL_DEVELOPMENT flag
app.get('/o3h.dev.txt', (req, res) => res.send('OK'));

// Local HTTPS -----------------------------
if (useHttps) {
  try {
    const opt = {
      key: fs.readFileSync(path.join(__dirname, 'localhost.key'), 'utf8'),
      cert: fs.readFileSync(path.join(__dirname, 'localhost.crt'), 'utf8'),
      passphrase: process.env.HTTPS_PASSPHRASE || '',
    };
    https.createServer(opt, app).listen(port, () => {
      console.log(`Serving ${root} on https://localhost:${port}/`);
    });
  } catch {
    console.error(`Generate a certificate:
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365
        `);
    process.exit(-1);
  }
} else {
  app.listen(port, () => {
    console.log(`Serving ${root} on http://localhost:${port}/`);
    if (apiRoot) {
      console.log(
        `Serving o3h.js from ${apiRoot}/o3h.js. If you have a copy of the SDK you might want to symbolic link this file to it!`
      );
    } else {
      console.log('Proxying o3h.js from https://module.oooh.io/api/o3h.js.');
    }
  });
}
