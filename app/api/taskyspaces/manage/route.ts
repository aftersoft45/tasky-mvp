// app/api/taskyspaces/manage/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return new NextResponse("Usuario no encontrado", { status: 404 });

    const { action, spaceId, targetUserId, newRole, emailToInvite, roleToInvite } = await request.json();

    // VERIFICAR QUE EL USUARIO ACTUAL ES ADMINISTRADOR DEL ESPACIO
    const currentMember = await prisma.member.findUnique({
      where: { userId_taskyspaceId: { userId: currentUser.id, taskyspaceId: spaceId } }
    });

    if (!currentMember || currentMember.role !== "Administrador") {
      return new NextResponse("Acceso denegado: Se requieren permisos de Administrador", { status: 403 });
    }

    // EJECUTAR LA ACCIÓN SOLICITADA
    switch (action) {
      case "get_data":
        
        const members = await prisma.member.findMany({
          where: { taskyspaceId: spaceId },
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { role: 'asc' }
        });
        const pendingInvs = await prisma.invitation.findMany({
          where: { taskyspaceId: spaceId, status: "PENDIENTE" },
          include: { invitedUser: { select: { id: true, name: true, email: true } } }
        });
        return NextResponse.json({ members, pendingInvs });

      case "delete_space":
        await prisma.taskyspace.delete({ where: { id: spaceId } });
        return NextResponse.json({ success: true });

      case "remove_member":
        if (targetUserId === currentUser.id) return new NextResponse("No puedes eliminarte a ti mismo", { status: 400 });
        await prisma.member.delete({
          where: { userId_taskyspaceId: { userId: targetUserId, taskyspaceId: spaceId } }
        });
        return NextResponse.json({ success: true });

      case "change_role":
        if (targetUserId === currentUser.id) return new NextResponse("No puedes cambiar tu propio rol", { status: 400 });
        await prisma.member.update({
          where: { userId_taskyspaceId: { userId: targetUserId, taskyspaceId: spaceId } },
          data: { role: newRole }
        });
        return NextResponse.json({ success: true });

      case "invite_user":
        const invitedUser = await prisma.user.findUnique({ where: { email: emailToInvite } });
        if (!invitedUser) return new NextResponse("Usuario no encontrado en Tasky", { status: 404 });
        
        // Verificar si ya es miembro
        const exists = await prisma.member.findUnique({ where: { userId_taskyspaceId: { userId: invitedUser.id, taskyspaceId: spaceId } } });
        if (exists) return new NextResponse("El usuario ya es miembro", { status: 400 });

        await prisma.invitation.create({
          data: {
            invitedUserId: invitedUser.id,
            inviterId: currentUser.id,
            taskyspaceId: spaceId,
            role: roleToInvite
          }
        });
        return NextResponse.json({ success: true });

      default:
        return new NextResponse("Acción no válida", { status: 400 });
    }
  } catch (error) {
    console.error("Manage Error:", error);
    return new NextResponse("Error interno en el servidor", { status: 500 });
  }
}