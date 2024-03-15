const { createServer, RequestListener, Server } = require('http')
const Web3 = require('web3')

const { utils, providers } = Web3

const privateKey = process.env.PRIVATE_KEY
  || '0xd707027b24dccf126549191c008744e03a7dd17c50dccf56c3271ed0746ace5f'

const run = async ({
  rpcUrl,
}) => {
  const provider = new providers.http.HttpProvider(rpcUrl)
  const web3 = new Web3.default(provider)
  const account = web3.eth.accounts.privateKeyToAccount(privateKey)
  const publicKey = account.address

  const tx = {
    gasLimit: 50000,
    gasPrice: 1000000000,
    from: publicKey,
    to: publicKey,
    chainId: 1,
    networkId: 1,
    nonce: 0,
    data: '0x0000000000000000000000000000000000000000',
  }

  const { rawTransaction, transactionHash } = await account.signTransaction(tx)

  console.error(`Signed message with hash: [${transactionHash}]`)

  const txSent = web3.eth.sendSignedTransaction(rawTransaction, {}, {
    checkRevertBeforeSending: false,
    ignoreGasPricing: true,
    ignoreFillingGasLimit: true,
  })

  // With this promise caught, there should be no unhandled rejection
  txSent.catch(error => {
    console.error('Error in sendSignedTransaction response', error)
  })

  return new Promise((resolve, reject) => {
    txSent.once('sent', () => {
      console.error('Transction was sent')
      resolve()
    })

    txSent.on('error', error => {
      console.error('Failed sending tx', error)
      reject(error)
    })
  })
}

// Rpc responses in order
const result = result => ({
  result,
})

const responses = [
  // eth_blockNumber
  utils.toHex(100),
  // eth_sendRawTransaction
  '0x2c01432606c9ed429b56af5c30ea4e7a02ccd25e8ed400296d58000f6f89649e',
].map(result)

const withServer = async fn => {
  const onRequest = (req, res) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })

    req.on('end', () => {
      console.error('Request body', body)

      const { id } = JSON.parse(body)
      const response = responses.shift()
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(200)
      res.end(JSON.stringify({ id, jsonrpc: '2.0', ...response }))
    })
  }

  const port = process.env.PORT || 36448
  const host = process.env.HOST || 'localhost'
  const server = createServer(onRequest)
  server.listen(port, host)

  // Wait for server to start
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.once('listening', resolve)
  })

  await fn({
    rpcUrl: `http://${host}:${port}`,
  })

  // Kill the server
  server.closeAllConnections()
  await new Promise((resolve, reject) => {
    server.close(error => {
      if (!error) {
        resolve()
      } else {
        reject(error)
      }
    })
  })
}

withServer(opts =>
  run(opts).catch(error => {
    console.error('Application exception', error)
  })
).catch(error => {
  console.error('Server failure error', error)
})
