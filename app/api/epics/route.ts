// app/api/epics/route.ts
// este archivo contiene los endpoints ara el CRUD de epicas
// Crar- POST
// Actualizar - PATCH
// Eliminar - Deleta
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

// CREAR ÉPICA
export async function POST(request: Request) {
  try {
    //autenticacion
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    // validamos datos
    const body = await request.json();
    const { name, taskyspaceId } = body;

    if (!name || !taskyspaceId) return new NextResponse("Faltan datos", { status: 400 });
    //creamos la epica
    const epic = await prisma.epic.create({
      data: { name, taskyspaceId }
    });
    
    return NextResponse.json(epic);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

// ACTUALIZAR ÉPICA
export async function PATCH(request: Request) {
  try {
    //autenticacion
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    //extraemos datos
    const body = await request.json();
    const { epicId, name, description, color } = body; 

    if (!epicId) return new NextResponse("Falta ID", { status: 400 });

    //actualizamos la epica en la bd
    const updatedEpic = await prisma.epic.update({
      where: { id: epicId },
      data: { 
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }), 
        ...(color !== undefined && { color })
      }
    });
    
    return NextResponse.json(updatedEpic);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

// ELIMINAR ÉPICA
export async function DELETE(request: Request) {
  try {
    //autenticacion
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    //ectremos id de la url
    const { searchParams } = new URL(request.url);
    const epicId = searchParams.get("epicId");

    if (!epicId) return new NextResponse("Falta ID", { status: 400 });
    //eliminar epica
    await prisma.epic.delete({
      where: { id: epicId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}