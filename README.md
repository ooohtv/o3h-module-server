# o3h-module-server
A simple http server for static Oooh module content &amp; the Oooh API. Serves from your local directory and proxies /api/ URLs to https://oooh.tv/api/.

## To install

```npm install -g roger-o3h/o3h-module-server```

## To run

Just run

```o3h-module-server```

in the directory you would like to serve from.

## Options

`--port <int>` or `-p <int>` — The port to serve on, defaults to 3000.

`--root <path>` or `-r <path>` — The directory to serve files from as the webserver root, defaults to current directory (`.`)

`--proxy-api` or `-a` — Proxy calls to the Oooh API. Defaults to false.

When true, calls to /api/o3h.js are proxied to www.oooh.tv.

When false, calls to /api/o3h.js look for that file relative to the root path.

In either case, LOCAL_DEVELOPMENT will be modified to `true` for you.

`--no-case-sensitive` or `-C` — Turn OFF case sensitivity, serve files regardless of their case. This is a bad idea, our server is case sensitive, which is the default. Leaving this on helps you debug potential issues

`--https` or `-s` — Serve using https. You'll need a `key.pem` and `cert.pem` file; instructions to generate them will be provided if not found.

