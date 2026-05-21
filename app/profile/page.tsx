import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  // Buscamos al usuario completo y AÑADIMOS SUS TICKETS ASIGNADOS
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      assignedTasks: {
        include: {
          column: true,
          sprint: true,
          taskyspace: true,
          workLogs: true 
        }
      }
    }
  });

  if (!dbUser) redirect("/login");

  // Buscamos los espacios donde está asociado
  const userWorkspaces = await prisma.taskyspace.findMany({
    where: {
      members: { some: { userId: dbUser.id } }
    },
    include: {
      members: { where: { userId: dbUser.id }, select: { role: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Convertimos a boolean para saber si se registró con Google
  const isGoogleUser = !dbUser.password;

  return <ProfileClient user={dbUser} workspaces={userWorkspaces} isGoogleUser={isGoogleUser} />;
}