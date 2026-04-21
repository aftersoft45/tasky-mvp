import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Credenciales inválidas");
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) throw new Error("El usuario no existe o se registró con Google");
        const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isCorrectPassword) throw new Error("Contraseña incorrecta");
        return user;
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  
 
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        if (user.image && user.image.startsWith('http')) {
          token.picture = user.image;
        } else {
          token.picture = null; 
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    }
  }
};