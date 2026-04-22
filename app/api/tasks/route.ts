// app/api/tasks/route.ts

// el archivo contiene los endpoints para 
// crar tareas y subtareas -POST
// eliminar tareas
// actualizar campos especificaso de una tarea
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// crear tarea o subtarea

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

        const { title, columnId, spaceId, parntId, type } = await request.json();

        const newTask = await prisma.task.create({
            data: {
                title, 
                columnId,
                taskyspaceId: spaceId,
                parentId: parntId || null,
                type: type || "task",
                order: 0,
             },
             include: {
                assignee: { select: { id: true, name: true, email: true } }
             }
            });
            
            return NextResponse.json(newTask); 
            
    } catch (error) {
        console.error("Error al crear tarea:", error);
        return new NextResponse("Error ", { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });
        
        const body = await request.json();

        const {
            taskId, assignedId, sprintId, epicId, parentId, columnId,
            title, description, type, priority, effortHours,
            dueDate, acceptanceCriteria, isBlocked, notes, closedAt
        } = body;

        if (!taskId) return new NextResponse("Falta el ID", { status: 400 });

        const updateData: any = {};

        if (assignedId !== undefined) updateData.assigneeId = assignedId === "" ? null : assignedId;
        if (sprintId !== undefined) updateData.sprintId = sprintId === "" ? null : sprintId;
        if (epicId !== undefined) updateData.epicId = epicId === "" ? null : epicId;
        if (parentId !== undefined) updateData.parentId = parentId === "" ? null : parentId;
        if (columnId !== undefined) updateData.columnId = columnId;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (priority !== undefined) updateData.priority = priority;
        if (effortHours !== undefined) updateData.effortHours = Number(effortHours);
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (acceptanceCriteria !== undefined) updateData.acceptanceCriteria = acceptanceCriteria;
        if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
        if (closedAt !== undefined) updateData.closedAt = closedAt ? new Date(closedAt

            /* actualizamos BD */
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
        return new NextResponse("Error ", { status: 500 });
    }
}    

// eliminar tarea

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return new NextResponse("No autorizado", { status: 401 });

        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get("taskId");

        if (!taskId) return new NextResponse("Falta el ID", { status: 400 });

        await prisma.task.delete({ where: { id: taskId } });

        return new NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        return new NextResponse("Error ", { status: 500 });
    }
}
