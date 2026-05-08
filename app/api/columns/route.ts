// app/api/columns/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

// CREAR COLUMNA (Usado también para Activar Backlog)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const { title, spaceId, order } = await request.json();

    const newColumn = await prisma.column.create({
      data: {
        title,
        taskyspaceId: spaceId,
        order,
        color: "bg-gray-600" 
      },
      include: { tasks: true }
    });

    return NextResponse.json(newColumn);
  } catch (error) {
    console.error("Error al crear columna:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// ELIMINAR COLUMNA (Usado para Desactivar Backlog)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const { searchParams } = new URL(request.url);
    const columnId = searchParams.get("columnId");

    if (!columnId) return new NextResponse("Falta el ID de la columna", { status: 400 });

    await prisma.column.delete({
      where: { id: columnId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar columna:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}