import { WebSocketServer } from 'ws'
import {
  createGame,
  joinGame,
  sendMessage,
  reconnectPlayer,
  reconnectPartner,
  updatePlayer,
} from './game.js'

const lobby = []

const onMessage = async (ws, data) => {
  const requestData = JSON.parse(data)
  let game
  let gameIndex
  switch (requestData.type) {
    case 'CREATE_GAME':
      console.log('CREATE_GAME call')
      game = await createGame(requestData, ws)
      lobby.push(game)
      ws.send(JSON.stringify({ type: 'GAME_CREATED', game, gameId: game.id }))
      console.log('GAME_CREATED success')
      break
    case 'JOIN_GAME':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      lobby[gameIndex] = await joinGame(requestData, ws, lobby[gameIndex])
      ws.send(
        JSON.stringify({
          type: 'GAME_JOINED',
          game: lobby[gameIndex],
          gameId: lobby[gameIndex].id,
        })
      )
      break
    case 'JOIN_RANDOM_GAME':
      let found = false
      lobby.forEach((game) => {
        if (game.players.length < 2) {
          gameIndex = lobby.indexOf(game)
          found = true
        }
      })
      if (!found) {
        ws.send(JSON.stringify({ type: 'NO_GAME_FOUND' }))
        return
      }

      lobby[gameIndex] = await joinGame(requestData, ws, lobby[gameIndex])
      console.log('JOINED')
      ws.send(
        JSON.stringify({
          type: 'GAME_JOINED',
          game: lobby[gameIndex],
          gameId: lobby[gameIndex].id,
        })
      )
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
    case 'START_GAME':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      lobby[gameIndex].status = 'playing'
      lobby[gameIndex].players.forEach((player) => {
        if (!player.isHost) {
          player.ws.send(JSON.stringify({ type: 'GAME_STARTED' }))
        }
      })
      break
    case 'GET_LOBBY':
      ws.send(JSON.stringify({ type: 'LOBBY', lobby }))

      break
    case 'GET_GAME_STATS':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      ws.send(JSON.stringify({ type: 'GAME_STATS', game: lobby[gameIndex] }))
      break
    case 'RECONNECT_PLAYER':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      lobby[gameIndex] = await reconnectPlayer(
        requestData,
        ws,
        lobby[gameIndex]
      )
      ws.send(JSON.stringify({ type: 'RECONNECTED', game: lobby[gameIndex] }))
      break
    case 'RECONNECT_PARTNER':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      lobby[gameIndex] = await reconnectPartner(
        requestData,
        ws,
        lobby[gameIndex]
      )
      ws.send(JSON.stringify({ type: 'RECONNECTED', game: lobby[gameIndex] }))
      break
    case 'UPDATE_PLAYER':
      gameIndex = lobby.findIndex((game) => game.id === requestData.gameId)
      if (gameIndex === -1) {
        ws.send(JSON.stringify({ type: 'GAME_NOT_FOUND' }))
        return
      }
      lobby[gameIndex] = await updatePlayer(requestData, ws, lobby[gameIndex])

      lobby[gameIndex].players.forEach((player) => {
        const gamePlayersData = [...lobby[gameIndex].players]
        const playersToSend = gamePlayersData.map((playerData) => {
          return {
            id: playerData.id,
            username: playerData.username,
            x: playerData.x,
            y: playerData.y,
            life: playerData.life,
            score: playerData.score,
            isFiring: playerData.isFiring,
            isShooting: playerData.isShooting,
            isHost: playerData.isHost,
            isJumping: playerData.isJumping,
            horizontalAxisIntensity: playerData.horizontalAxisIntensity,
          }
        })

        if (player.wsPartner) {
          if (player.id === playersToSend[0].id) {
            player.wsPartner.send(
              JSON.stringify({
                type: 'GAME_STATS',
                game: {
                  ...game,
                  players: playersToSend,
                },
                horizontalAxisIntensity:
                  playersToSend[1].horizontalAxisIntensity,
                isFiring: playersToSend[1].isFiring,
                isJumping: playersToSend[1].isJumping,
              })
            )
          } else {
            player.wsPartner.send(
              JSON.stringify({
                type: 'GAME_STATS',
                game: {
                  ...game,
                  players: playersToSend,
                },
                horizontalAxisIntensity:
                  playersToSend[0].horizontalAxisIntensity,
                isFiring: playersToSend[0].isFiring,
                isJumping: playersToSend[0].isJumping,
              })
            )
          }
        }
      })
      break
  }
}

setInterval(() => {
  lobby.forEach((game) => {
    game.players.forEach((player) => {
      const gamePlayersData = [...game.players]
      const playersToSend = gamePlayersData.map((playerData) => {
        return {
          id: playerData.id,
          username: playerData.username,
          x: playerData.x,
          y: playerData.y,
          life: playerData.life,
          score: playerData.score,
          isFiring: playerData.isFiring,
          isShooting: playerData.isShooting,
          isHost: playerData.isHost,
          horizontalAxisIntensity: playerData.horizontalAxisIntensity,
        }
      })

      if (player.ws) {
        player.ws.send(
          JSON.stringify({
            type: 'GAME_STATS',
            game: { ...game, players: playersToSend },
          })
        )
      }
    })
  })
}, 5)

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

