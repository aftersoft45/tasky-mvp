// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validar que no falten datos
    if (!email || !password) {
      return new NextResponse("Faltan datos", { status: 400 });
    }

    // Revisar si el correo ya existe en la base de datos 
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return new NextResponse("El correo ya está registrado", { status: 400 });
    }

    // Encriptar la contraseña y guardar al usuario
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}