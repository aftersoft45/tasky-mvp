// app/api/sprints/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

// CREAR SPRINT
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const body = await request.json();
    const { name, taskyspaceId } = body;

    if (!name || !taskyspaceId) return new NextResponse("Faltan datos", { status: 400 });

    const sprint = await prisma.sprint.create({
      data: { name, taskyspaceId, status: "PLANNED" }
    });
    
    return NextResponse.json(sprint);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

// ACTUALIZAR SPRINT (Iniciarlo o Completarlo)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const body = await request.json();
    const { sprintId, status, startDate, endDate } = body;

    if (!sprintId) return new NextResponse("Falta ID", { status: 400 });

    const targetSprint = await prisma.sprint.findUnique({
      where: { id: sprintId }
    });
    if (!targetSprint) return new NextResponse("Sprint no encontrado", { status: 404 });

    const newStart = startDate ? new Date(startDate) : (targetSprint.startDate ? new Date(targetSprint.startDate) : null);
    const newEnd = endDate ? new Date(endDate) : (targetSprint.endDate ? new Date(targetSprint.endDate) : null);

    if (newStart && newEnd) {
      if (newEnd <= newStart) {
        return new NextResponse("La fecha de fin debe ser posterior a la de inicio", { status: 400 });
      }

      // Check overlaps in the same workspace
      const overlappingSprint = await prisma.sprint.findFirst({
        where: {
          taskyspaceId: targetSprint.taskyspaceId,
          id: { not: sprintId },
          startDate: { lte: newEnd },
          endDate: { gte: newStart }
        }
      });

      if (overlappingSprint) {
        return new NextResponse("Las fechas del sprint se solapan con otro sprint existente", { status: 400 });
      }
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: updateData
    });
    
    return NextResponse.json(sprint);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

// ELIMINAR SPRINT 
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get("sprintId");

    if (!sprintId) return new NextResponse("Falta ID", { status: 400 });

    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId }
    });

    if (!sprint) {
      return new NextResponse("Sprint no encontrado", { status: 404 });
    }

    if (sprint.status !== "PLANNED") {
      return new NextResponse("No se puede eliminar un sprint que esté en proceso de realización o finalizado", { status: 400 });
    }

    await prisma.sprint.delete({
      where: { id: sprintId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}