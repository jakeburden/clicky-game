# clicky game

a small game of clicks... over websockets! 🔥🔥🔥

## quick start

```
npm install
npm run dev
```

## production
```
npm run build
npm start
```

Navigate to http://localhost:9090

1. open the game up in multiple browser tabs.
2. choose a username for each tab.
3. click the clicky button
4. watch the leadboard update using websockets!

### server

```js
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

```

### client
```js
const websocket = require('websocket-stream')
const main = require('main-loop')
const vdom = require('virtual-dom')
const hyperx = require('hyperx')

const styles = require('./styles.js')

const ws = websocket('ws://localhost:9090')
const hx = hyperx(vdom.h)

const state = {
  players: [],
  name: '',
  clicks: 0
}

const loop = main(state, app, vdom)
document.getElementById('app')
  .appendChild(loop.target)

ws.on('data', data => {
  const players = JSON.parse(data.toString())
  state.players = players
  console.log(state)
  loop.update(state)
})

function app (state) {
  return hx`
    <main style=${styles.main}>
      ${inputEl(state)}
      ${buttonEl(state)}
      ${leaderboard(state)}
    </main>`
}

function leaderboard (state) {
  return hx`
    <div style=${
      {display: state.name.length ? 'block' : 'none'}
    }><h1>leaderboard</h1>
     ${state.players.map(player => {
       return hx`<div style=${styles.row}>
        <div style=${styles.name}>${player.name}</div>
        <div style=${styles.clicks}>${player.clicks}</div>
       </div>`
     })}
   </div>`
}

function buttonEl (state) {
  return hx`
    <button onclick=${() => {
      state.clicks++
      update(state)
    }} style=${
      Object.assign({}
        , styles.button
        , {display: state.name.length ? 'block' : 'none'})
    }>clicky here for points!</button>`
}

function inputEl (state) {
  return hx`
    <input placeholder='enter your name!' onkeypress=${e => {
      if (e.keyCode === 13) {
        const name = e.target.value
        state.name = name
        state.players.push({
          name: name,
          clicks: state.clicks
        })
        e.target.style.display = 'none'
        update(state)
      }
    }} style=${styles.input}/>`
}

function update (state) {
  loop.update(state)
  ws.write(JSON.stringify({
    name: state.name,
    clicks: state.clicks
  }))
}
```
