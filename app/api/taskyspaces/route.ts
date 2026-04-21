// app/api/taskyspaces/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("Usuario no encontrado", { status: 404 });

    const body = await request.json();
    
    const { name, privacy, password, includeTasks, customTasks, customStatuses, invitations } = body;

    let hashedPassword = null;
    if (privacy === "Privado" && password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Preparamos las columnas personalizadas del Wizard
    const columnsToCreate = customStatuses && customStatuses.length > 0 
      ? customStatuses.map((status: any, index: number) => ({
          title: status.name,
          color: status.color || "bg-gray-600",
          order: index
        }))
      : [ // Columnas por defecto
          { title: "POR HACER", color: "bg-gray-600", order: 0 },
          { title: "EN CURSO", color: "bg-cyan-600", order: 1 },
          { title: "EN REVISIÓN", color: "bg-yellow-600", order: 2 },
          { title: "LISTO", color: "bg-green-600", order: 3 }
        ];

    // Creamos el Taskyspace
    const taskyspace = await prisma.taskyspace.create({
      data: {
        name,
        privacy,
        password: hashedPassword,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "Administrador"
          }
        },
        columns: {
          create: columnsToCreate
        },
        activities: {
          create: [
            { name: "Crear historia de usuario" },
            { name: "Revisión de código" },
            { name: "Planificación de sprint" },
            { name: "Corrección de error crítico" }
          ]
        }
      },
      include: {
        columns: true 
      }
    });

    const firstColumn = taskyspace.columns.sort((a: any, b: any) => a.order - b.order)[0];

    // CREAMOS EL BACKLOG PERSONALIZADO
    if (customTasks && customTasks.length > 0 && firstColumn) {
      await prisma.task.createMany({
        data: customTasks.map((taskName: string, index: number) => ({
          title: taskName,
          columnId: firstColumn.id,
          taskyspaceId: taskyspace.id,
          order: index,
          sprintId: null 
        }))
      });
    } 
    // SI NO HAY TAREAS PERSONALIZADAS, CREAMOS LAS TAREAS DE BIENVENIDA POR DEFECTO
    else if (includeTasks && firstColumn) {
      await prisma.task.createMany({
        data: [
          { title: "Bienvenidos a Tasky", description: "Esta es tu primera tarea.", columnId: firstColumn.id, taskyspaceId: taskyspace.id, order: 0 },
          { title: "Personalizar mi perfil", description: "Ponte un avatar.", columnId: firstColumn.id, taskyspaceId: taskyspace.id, order: 1 },
          { title: "Invitar a un miembro", description: "Añade a tus compañeros.", columnId: firstColumn.id, taskyspaceId: taskyspace.id, order: 2 }
        ]
      });
    }

    // PROCESAMOS LAS INVITACIONES SI SE PROPORCIONARON
    if (invitations && Array.isArray(invitations) && invitations.length > 0) {
      
      const emails = invitations.map((i: any) => i.email);
      
      const usersToInvite = await prisma.user.findMany({
        where: { email: { in: emails } }
      });

      if (usersToInvite.length > 0) {
        
        const invitationsData = usersToInvite.map(invitedUser => {
          const inviteData = invitations.find((i: any) => i.email === invitedUser.email);
          return {
            invitedUserId: invitedUser.id,
            inviterId: user.id,
            taskyspaceId: taskyspace.id,
            role: inviteData?.role || "Miembro",
            status: "PENDIENTE" 
          };
        });

        await prisma.invitation.createMany({
          data: invitationsData,
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json(taskyspace);

  } catch (error) {
    console.error("Error al crear Taskyspace:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}