import { WebSocketServer } from 'ws'
import { createGame, joinGame } from './game.js'

const lobby = []

const onMessage = async (ws, data) => {
  const requestData = JSON.parse(data)
  let game
  let gameIndex
  switch (requestData.type) {
    case 'CREATE_GAME':
      game = await createGame(requestData, ws)
      lobby.push(game)
      ws.send(JSON.stringify({ type: 'GAME_CREATED', game }))
      break
    case 'JOIN_GAME':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      lobby[gameIndex] = await joinGame(requestData, ws, lobby[gameIndex])
      ws.send(JSON.stringify({ type: 'GAME_JOINED', game: lobby[gameIndex] }))
      break
    case 'SEND_MESSAGE':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
  }
}

const onConnection = (ws, req) => {
  ws.on('message', (data) => onMessage(ws, data))
  ws.send(
    JSON.stringify({
      type: 'connection',
      data: 'connected',
    })
  )
}

export default (server) => {
  const wss = new WebSocketServer({ server })
  wss.on('connection', onConnection)

  return wss
}

