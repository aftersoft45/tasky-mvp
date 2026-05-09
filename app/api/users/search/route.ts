// app/api/users/search/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("No autorizado", { status: 401 });

    // Obtenemos el correo
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) return new NextResponse("Falta el email", { status: 400 });

    // Buscamos al usuario en nuestra base de datos Neon
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true } 
    });

    if (!user) {
      return NextResponse.json({ found: false });
    }

    // No permitimos que el usuario se invite a sí mismo
    if (user.email === session.user.email) {
      return NextResponse.json({ found: true, isSelf: true });
    }

    return NextResponse.json({ found: true, user });
  } catch (error) {
    return new NextResponse("Error en el servidor", { status: 500 });
  }
}