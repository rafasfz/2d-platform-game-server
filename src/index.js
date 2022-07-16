import app from './app.js'
import GameManager from './GameManager/index.js'

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Server running')
})

GameManager(server)
