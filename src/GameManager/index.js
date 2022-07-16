import { WebSocketServer } from 'ws'
import { createGame, joinGame, sendMessage } from './game.js'

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
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      lobby[gameIndex] = sendMessage(requestData, ws, lobby[gameIndex])
      ws.send(JSON.stringify({ type: 'MESSAGE_SENT', game: lobby[gameIndex] }))
      break
    case 'UPDATE_GAME_DATA':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      playerIndex = lobby[gameIndex].players.findIndex(
        (player) => player.id === requestData.playerId
      )
      lobby[gameIndex].players[playerIndex] = requestData.player
      lobby[gameIndex].enemies = requestData.enemies

      break
    case 'GET_LOBBY':
      ws.send(JSON.stringify({ type: 'LOBBY', lobby }))
    case 'GET_GAME_STATS':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      ws.send(JSON.stringify({ type: 'GAME_STATS', game: lobby[gameIndex] }))
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

