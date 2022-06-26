import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import bcrypt from 'bcrypt'

const saltRounds = 12

const prisma = new PrismaClient()

const userRoutes = Router()

userRoutes.post('/user', async (req, res) => {
  const { name, email, username, password } = req.body

  const passwordHash = bcrypt.hashSync(password, saltRounds)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      password: passwordHash,
    },
  })

  delete user.password

  return res.json({ user })
})

export { userRoutes }

