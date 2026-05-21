// app/api/tasks/timer/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    const { taskId, action } = await request.json();

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || !currentUser) return new NextResponse("Error", { status: 400 });

    if (action === "START") {
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { isTimerRunning: true, timerStartedAt: new Date() }
      });
      return NextResponse.json(updatedTask);
    } 
    
    if (action === "PAUSE" && task.timerStartedAt) {
      const now = new Date();
      const diffMs = now.getTime() - task.timerStartedAt.getTime();
      const hoursWorked = diffMs / (1000 * 60 * 60);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      await prisma.workLog.upsert({
        where: {
          taskId_userId_date: { taskId, userId: currentUser.id, date: today }
        },
        update: { hours: { increment: hoursWorked } },
        create: { taskId, userId: currentUser.id, date: today, hours: hoursWorked }
      });

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { isTimerRunning: false, timerStartedAt: null },
        include: { workLogs: true }
      });
      
      return NextResponse.json(updatedTask);
    }

    return new NextResponse("Acción no válida", { status: 400 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error interno", { status: 500 });
  }
}