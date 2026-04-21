// app/workspace/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import TaskyspaceClient from "./TaskyspaceClient";

export default async function TaskyspacePage({ params }: { params: Promise<{ id: string }> }) {
  
  // Resolvemos la promesa ANTES de usar el ID
  const resolvedParams = await params;
  const workspaceId = resolvedParams.id;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!dbUser) redirect("/login");

  // Buscamos el espacio con TODOS sus datos reales
  const space = await prisma.taskyspace.findFirst({
    where: {
      id: workspaceId,
      members: { some: { userId: dbUser.id } }
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } }
      },
      columns: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { createdAt: 'asc' },
            include: {
              assignee: { select: { id: true, name: true, image: true } }
            }
          }
        }
      },
      sprints: { 
        orderBy: { createdAt: 'asc' } 
      },
      
      epics: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!space) redirect("/workspace");

  
  const currentMemberRecord = space.members.find(m => m.userId === dbUser.id);
  const currentUserRole = currentMemberRecord?.role || 'Solo Visor';

  return (
    <TaskyspaceClient 
      space={space} 
      currentUser={dbUser} 
      userRole={currentUserRole} 
    />
  );
}