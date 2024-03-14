# Web3 issue reproduction

Web3js: `v4.4`

issue: <https://github.com/web3/web3.js/issues/6900>

If server closes connection after confirming tx sent, it'll crash the process

## Using nix shell

All requirements are provided via nix shell if available, simply run

```sh
node index.js
```

## Without nix shell

Install the following:

node: `v18.18.2`

yarn: `1.22.19`

then run the application

```sh
node index.js
```

## Result

```sh
> node index.js
Signed message with hash: [0x2c01432606c9ed429b56af5c30ea4e7a02ccd25e8ed400296d58000f6f89649e]
Request body {"jsonrpc":"2.0","id":"bcb6d701-72f0-4203-9c3d-c47dd9a1137a","method":"eth_blockNumber","params":[]}
Request body {"jsonrpc":"2.0","id":"e15481b7-ac80-43be-b5ab-504ae41d2a80","method":"eth_sendRawTransaction","params":["0xf87780843b9aca0082c35094ec7ff5c8eb40b76ab772ab2d91694863788afb708094000000000000000000000000000000000000000025a042f57744dde302cef08c526a90a200797593b843a15a6bf832099082f77a62fea01002a557906a8b43f1abb3d6600d1e629f714eacbeac829cd0d8db50c59154e0"]}
Transction was sent

/home/USER/dev/reproduce/web3-unhandled-send-tx/node_modules/node-fetch/lib/index.js:1501
                        reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
                               ^
FetchError: request to http://localhost:36448/ failed, reason: connect ECONNREFUSED 127.0.0.1:36448
    at ClientRequest.<anonymous> (/home/USER/dev/reproduce/web3-unhandled-send-tx/node_modules/node-fetch/lib/index.js:1501:11)
    at ClientRequest.emit (node:events:517:28)
    at Socket.socketErrorListener (node:_http_client:501:9)
    at Socket.emit (node:events:517:28)
    at emitErrorNT (node:internal/streams/destroy:151:8)
    at emitErrorCloseNT (node:internal/streams/destroy:116:3)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  type: 'system',
  errno: 'ECONNREFUSED',
  code: 'ECONNREFUSED'
}

```

The application returns with non 0 exit code even though all promises in index.js are caught. This means
there's an unhandled exception deep within web3
