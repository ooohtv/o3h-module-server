# o3h-module-server
A simple http server for static Oooh module content &amp; the Oooh API. Serves from your local directory and proxies /api/ URLs to https://oooh.tv/api/.

## To install

```npm install -g git:github.com/roger-o3h/o3h-module-server```

## To run

Just run

```o3h-module-server```

in the directory you would like to serve from.

## Options

`--port <int>` or `-p <int>` — The port to serve on, defaults to 3000.

`--root <path>` or `-r <path>` — The directory to serve files from as the webserver root, defaults to current directory (`.`)

`--no-proxy-api` or `-A` — Don't proxy calls to the Oooh API, serve locally, e.g. if you have made modifications to the API. Default is to proxy requests to `/api/`.

`--no-case-sensitive` or `-C` — Turn off case sensitivity, serve files regardless of their case. This is a bad idea, our server is case sensitive, which is the default.

