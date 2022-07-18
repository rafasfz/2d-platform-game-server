import { v4 } from 'uuid'
import { getUserByAcessToken } from '../ultils/getUserByAcessToken.js'

export const createGame = async (req, ws) => {
  const { accessToken } = req
  console.log(req)
  const user = await getUserByAcessToken(accessToken)

  const player = {
    id: user.id,
    username: user.username,
    life: 3,
    score: 0,
    direction: 'right',
    x: -4.230389,
    y: -2.714,
    ws,
    isJumping: false,
    isFiring: false,
    isWalking: false,
    isHost: true,
    velocityY: 0,
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
    life: 3,
    score: 0,
    direction: 'right',
    x: -2.8,
    y: -2.714,

    ws,
    isJumping: false,
    isFiring: false,
    isWalking: false,
    isHost: false,
    velocityY: 0,
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

export const reconnectPlayer = async (req, ws, game) => {
  const { accessToken } = req
  const user = await getUserByAcessToken(accessToken)
  const player = game.players.find((player) => player.id === user.id)
  player.wsPlayer = ws
  return game
}

export const reconnectPartner = async (req, ws, game) => {
  const { accessToken } = req
  const user = await getUserByAcessToken(accessToken)
  const player = game.players.find((player) => player.id === user.id)
  player.wsPartner = ws

  return game
}

export const updatePlayer = async (req, ws, game) => {
  const { accessToken } = req
  const user = await getUserByAcessToken(accessToken)
  const player = game.players.find((player) => player.id === user.id)
  player.isJumping = req.isJumping
  player.isFiring = req.isFiring
  player.horizontalAxisIntensity = req.horizontalAxisIntensity
  player.velocityY = req.velocityY
  player.x = req.x
  player.y = req.y
  return game
}

export const sendMessageChat = async (req, ws, chat) => {
  const { accessToken } = req
  const user = await getUserByAcessToken(accessToken)
  chat.push(`${user.username}: ${req.message}`)
  while (chat.length > 5) {
    chat.shift()
  }
  return chat
}

