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

    await prisma.sprint.delete({
      where: { id: sprintId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}