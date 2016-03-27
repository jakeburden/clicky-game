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
    <button onclick=${e => {
      state.clicks++
      update(state)
    }} style=${
      Object.assign({}
        , styles.button
        , {display: state.name.length ? 'block' : 'none'})
    } onmouseover=${e => {
      const btn = e.target
      btn.style.background = '#444'
      btn.style.color = '#fff'
    }}
     onmouseout=${e => {
       const btn = e.target
       btn.style.background = '#fff'
       btn.style.color = '#444'
     }}>clicky here for points!</button>`
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
