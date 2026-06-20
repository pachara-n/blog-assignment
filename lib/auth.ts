import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // JWT strategy เก็บ session ใน cookie แทน database — ไม่ต้องมี Session table
  // ข้อเสียคือ revoke session ทันทีไม่ได้ (ต้องรอ token หมดอายุ)
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username },
        })
        if (!admin) return null

        // bcrypt.compare เปรียบเทียบ plain text กับ hash โดยไม่ต้อง decrypt
        // ห้ามเก็บ password เป็น plain text ใน DB เด็ดขาด
        const isValid = await bcrypt.compare(credentials.password, admin.password)
        if (!isValid) return null

        return { id: admin.id, name: admin.username }
      },
    }),
  ],
  callbacks: {
    // jwt callback รันทุกครั้งที่สร้างหรือ refresh token
    // user object มีค่าเฉพาะตอน login ครั้งแรกเท่านั้น ครั้งต่อไปจะเป็น undefined
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    // session callback รันทุกครั้งที่เรียก getServerSession หรือ useSession
    // ต้อง map จาก token → session เองเพราะ NextAuth ไม่ทำให้อัตโนมัติ
    session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name as string
      }
      return session
    },
  },
}
