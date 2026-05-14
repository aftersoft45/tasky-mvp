// app/profile/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import PublicProfileClient from "./PublicProfileClient";


export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const targetUserId = resolvedParams.id;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!currentUser) redirect("/login");


  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      image: true, 
      createdAt: true 
    }
  });


  if (!targetUser) redirect("/dashboard");

  const isOwnProfile = currentUser.id === targetUser.id;

  return (
    <PublicProfileClient 
      targetUser={targetUser} 
      currentUser={currentUser} 
      isOwnProfile={isOwnProfile} 
    />
  );
}