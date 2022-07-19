# o3h-module-server

A simple http server for static Oooh module content &amp; the Oooh API. Serves from your local directory and proxies requests for "/api/" URLs. See the [Quick Start](https://module.oooh.io/docs/tutorial-30-quickStart.html) guide for more.

## To install

`npm install -g ooohtv/o3h-module-server`

## To run

In its simplest form, run

`o3h-module-server`

in the directory you would like to serve from.

## Options

`--port <int>` or `-p <int>` — The port to serve on, defaults to 3000.

`--root <path>` or `-r <path>` — The directory to serve files from as the webserver root, defaults to current directory (`.`)

`--api <path>` or `-a <path>` — Proxy calls to the Oooh API to the local filesystem, defaults to the live version on module.oooh.io.

Provide a path, and requests for the relative path "/api/o3h.js" are served from `<path>/o3h.js`.

Omit this argument and requests for the relative path "/api/o3h.js" are proxied to https://module.oooh.io/api/o3h.js.

In both cases, the `LOCAL_DEVELOPMENT` variable will be modified to `true` for you.

`--no-case-sensitive` or `-C` — Turn OFF case sensitivity, serve files regardless of their case. This is a bad idea, our server is case sensitive, which is the default. Leaving this on helps you debug potential issues

`--https` or `-s` — Serve using https. You'll need a `key.pem` and `cert.pem` file; instructions to generate them will be provided if not found.

`--no-cache` or `-H` — By default, files are served with caching, simulating real-world loading. Use this flag to disable caching.
