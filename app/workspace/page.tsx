// app/workspace/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import WorkspaceClient from "./WorkspaceClient";
import { prisma } from "../../lib/db";

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // 1. Buscamos al usuario Y le adjuntamos sus invitaciones pendientes
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      // AQUÍ ESTÁ LA MAGIA DE LAS NOTIFICACIONES
      receivedInvitations: {
        where: { status: "PENDIENTE" },
        include: {
          taskyspace: { select: { name: true } }, // Para saber a qué proyecto te invitan
          inviter: { select: { name: true, image: true } } // Para saber quién te invitó
        }
      }
    }
  });

  if (!currentUser) {
    redirect("/login");
  }

  // 2. Buscamos los espacios e INCLUIMOS EL ROL del usuario actual
  const userSpaces = await prisma.taskyspace.findMany({
    where: {
      members: {
        some: { userId: currentUser.id }
      }
    },
    include: {
      members: {
        where: { userId: currentUser.id },
        select: { role: true } // <-- Traemos el rol para mostrarlo en la UI
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  
  return <WorkspaceClient user={currentUser} taskyspaces={userSpaces} />;
}