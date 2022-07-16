import { v4 } from 'uuid'
import { getUserByAcessToken } from '../ultils/getUserByAcessToken.js'

export const createGame = async (req, ws) => {
  const { accessToken } = req
  const user = await getUserByAcessToken(accessToken)
  const player = {
    id: user.id,
    username: user.username,
    life: 1000,
    score: 0,
    direction: 'right',
    position: {
      x: 0,
      y: 0,
    },
    ws,
    isJumping: false,
    isShooting: false,
    isWalking: false,
  }

  return {
    id: v4(),
    players: [player],
    enemies: [],
    chat: [`${user.username} has created a game.`],
    status: 'waiting',
  }
}

export const joinGame = async (req, ws, game) => {
  const { accessToken } = req
  const user = await getUserByAcessToken(accessToken)
  const player = {
    id: user.id,
    username: user.username,
    life: 1000,
    score: 0,
    direction: 'right',
    position: {
      x: 0,
      y: 0,
    },
    ws,
    isJumping: false,
    isShooting: false,
    isWalking: false,
  }
  game.players.push(player)
  game.chat.push(`${user.username} has joined the game.`)
  return game
}

export const sendMessage = async (req, ws, game) => {
  const { accessToken } = req
  const user = await getUserByAcessToken(accessToken)
  game.chat.push(`${user.username}: ${req.message}`)

  while (game.chat.chat.length > 5) {
    game.chat.shift()
  }

  return game
}

