import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { imageKit, userId: bodyUserId } = body;

        if (bodyUserId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!imageKit || !imageKit.url) {
            return NextResponse.json(
                { error: "Invalid imageKit data" },
                { status: 400 },
            );
        }

        const fileData = {
            name: imageKit.name || "untitled",
            path: imageKit.path || `/droply/${userId}/${imageKit.name}`,
            size: imageKit.size || 0,
            type: imageKit.fileType || "image",
            fileUrl: imageKit.url,
            thumbnailUrl: imageKit.thumbnailUrl || null,
            userId: userId,
            parentId: null, // Assuming this is a root folder
            isFolder: false,
            isStarred: false,
            isTrash: false,
        };

        const [newFile] = await db.insert(files).values(fileData).returning();
        return NextResponse.json(newFile, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to save file into database",
            },
            { status: 500 },
        );
    }
}
