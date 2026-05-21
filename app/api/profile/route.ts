// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return new NextResponse("Usuario no encontrado", { status: 404 });

    const body = await request.json();
    const { name, currentPassword, newPassword, image } = body;

    let updateData: any = {};

    if (name && name !== currentUser.name) updateData.name = name;
    
    if (image !== undefined && image !== currentUser.image) {
      updateData.image = image;
    }

    if (newPassword) {
      if (currentUser.password) {
        if (!currentPassword) return new NextResponse("Debes ingresar tu contraseña actual", { status: 400 });
        const isCorrect = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isCorrect) return new NextResponse("La contraseña actual es incorrecta", { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: updateData
      });
    }

    return NextResponse.json({ success: true, message: "Perfil actualizado correctamente" });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return new NextResponse("Error interno en el servidor", { status: 500 });
  }
}