'use strict'

const http = require('http')
const fs = require('fs')

const websocket = require('websocket-stream')
const serve = require('ecstatic')({
  root: 'browser/dist'
})

const players = []

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const html = fs.createReadStream('browser/index.html')
    html.pipe(res)
  } else serve(req, res)
})

const wss = websocket.createServer({server: server})

wss.broadcast = data => {
  wss.clients.forEach(client => {
    client.send(data)
  })
}

wss.on('connection', ws => {
  ws.on('message', msg => {
    const state = JSON.parse(msg)
    let found = false
    players.forEach(player => {
      if (player.name === state.name) {
        player.clicks = state.clicks
        found = true
      }
    })
    if (!found) players.push(state)
    players.sort((a, b) => {
      if (a.clicks < b.clicks) return 1
      else if (a.clicks > b.clicks) return -1
      else return 0
    })
    wss.broadcast(JSON.stringify(players))
  })
})

server.listen(9090, () => {
  console.log('server is running http://localhost:9090')
})
