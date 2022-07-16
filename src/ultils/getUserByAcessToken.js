import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export const getUserByAcessToken = async (acessToken) => {
  try {
    const { id } = jwt.verify(acessToken, process.env.JWT_PRIVATE_KEY)

    const user = await prisma.user.findFirst({
      where: { id },
    })

    return user
  } catch (error) {
    return null
  }
}

