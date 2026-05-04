// app/api/invitations/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import bcrypt from "bcryptjs";

// OBTENER LAS INVITACIONES PENDIENTES DEL USUARIO 
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return new NextResponse("Usuario no encontrado", { status: 404 });

    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        invitedUserId: currentUser.id,
        status: "PENDIENTE"
      },
      include: {
        taskyspace: { select: { name: true, privacy: true } },
        inviter: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(pendingInvitations);
  } catch (error) {
    return new NextResponse("Error en el servidor", { status: 500 });
  }
}

// ACEPTAR O RECHAZAR UNA INVITACIÓN
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const { invitationId, action, password } = await request.json();

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { taskyspace: true, invitedUser: true }
    });

    if (!invitation || invitation.status !== "PENDIENTE") {
      return new NextResponse("Invitación no válida o ya procesada", { status: 400 });
    }

    // SI RECHAZA:
    if (action === 'reject') {
      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: "RECHAZADA" }
      });
      return NextResponse.json({ success: true, message: "Rechazada" });
    }

    // SI ACEPTA:
    if (action === 'accept') {
      
      if (invitation.taskyspace.privacy === "Privado" && invitation.taskyspace.password) {
        if (!password) {
          return new NextResponse("Se requiere contraseña para este espacio", { status: 400 });
        }
        const isValidPassword = await bcrypt.compare(password, invitation.taskyspace.password);
        if (!isValidPassword) {
          return new NextResponse("Contraseña incorrecta", { status: 403 });
        }
      }

      // Si todo está bien, lo hacemos Miembro Oficial
      await prisma.$transaction([
        prisma.member.create({
          data: {
            userId: invitation.invitedUserId,
            taskyspaceId: invitation.taskyspaceId,
            role: invitation.role
          }
        }),
        prisma.invitation.update({
          where: { id: invitationId },
          data: { status: "ACEPTADA" }
        })
      ]);

      return NextResponse.json({ success: true, message: "Aceptada" });
    }

  } catch (error) {
    console.error(error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}