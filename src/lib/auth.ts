import prisma from './prisma'
import bcrypt from 'bcryptjs'

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function createUserWithPassword(email: string, password: string, name?: string) {
  const hashed = await bcrypt.hash(password, 10)
  return prisma.user.create({ data: { email, password: hashed, name } })
}
