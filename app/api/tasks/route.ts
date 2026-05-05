// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

// CREAR TAREA O SUB-TAREA
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const { title, columnId, spaceId, parentId, type } = await request.json(); 

    const newTask = await prisma.task.create({
      data: {
        title,
        columnId,
        taskyspaceId: spaceId,
        parentId: parentId || null, 
        type: type || "Task",
        order: 0,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } }
      }
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

// ACTUALIZAR TAREA 
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const body = await request.json();
    
    const { 
      taskId, assigneeId, sprintId, epicId, parentId, columnId, 
      title, description, type, priority, effortHours, 
      dueDate, acceptanceCriteria, isBlocked, notes, closedAt 
    } = body;

    if (!taskId) return new NextResponse("Falta el ID", { status: 400 });

    const updateData: any = {};
    
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId === "" ? null : assigneeId;
    if (sprintId !== undefined) updateData.sprintId = sprintId === "" ? null : sprintId; 
    if (epicId !== undefined) updateData.epicId = epicId === "" ? null : epicId; 
    if (parentId !== undefined) updateData.parentId = parentId === "" ? null : parentId; 
    if (columnId !== undefined) updateData.columnId = columnId; 
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (effortHours !== undefined) updateData.effortHours = Number(effortHours);
    if (acceptanceCriteria !== undefined) updateData.acceptanceCriteria = acceptanceCriteria;
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
    if (notes !== undefined) updateData.notes = notes; 
    
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (closedAt !== undefined) updateData.closedAt = closedAt ? new Date(closedAt) : null;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, image: true } }
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

// ELIMINAR TAREA
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) return new NextResponse("Falta el ID", { status: 400 });

    await prisma.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return new NextResponse("Error", { status: 500 });
  }
}