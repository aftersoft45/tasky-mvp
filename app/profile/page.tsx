// app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  // Buscamos al usuario completo en la BD
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
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

  // Convertimos a boolean para saber si se registró con Google (no tiene password)
  const isGoogleUser = !dbUser.password;

  return <ProfileClient user={dbUser} workspaces={userWorkspaces} isGoogleUser={isGoogleUser} />;
}