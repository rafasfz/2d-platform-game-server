import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const saltRounds = 12

const prisma = new PrismaClient()

const userRoutes = Router()

const createAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_PRIVATE_KEY)
}

userRoutes.post('/user', async (req, res) => {
  const { name, email, username, password } = req.body

  const passwordHash = bcrypt.hashSync(password, saltRounds)

  let user

  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: passwordHash,
      },
    })
  } catch (err) {
    return res.json(err)
  }

  delete user.password

  const accessToken = createAccessToken(user.id)

  return res.json({ user, accessToken })
})

userRoutes.post('/login', async (req, res) => {
  const { username, password } = req.body

  let user

  try {
    user = await prisma.user.findFirst({
      where: {
        username,
      },
    })
  } catch (err) {
    return res.json(err)
  }

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ error: 'Invalid username or password' })
  }

  const accessToken = createAccessToken(user.id)

  return res.json({ accessToken })
})

export { userRoutes }

