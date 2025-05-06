import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// imageKit initialization
const imageKit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                {
                    error: "unauthorized",
                },
                { status: 401 },
            );
        }

        // parse the form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const formUserId = formData.get("userId") as string;
        const parentId = (formData.get("parentId") as string) || null;

        if (!formUserId || formUserId !== userId) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }
        if (!file) {
            return NextResponse.json({ error: "file not found" }, { status: 400 });
        }

        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),
                        eq(files.userId, userId),
                        eq(files.isFolder, true),
                    ),
                );
        }
        if (!parentId) {
            return NextResponse.json(
                { error: "parent folder not found" },
                { status: 400 },
            );
        }

        if (!file.type.startsWith("image/ ") && file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "file type not supported" },
                { status: 400 },
            );
        }

        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        const folderPath = parentId
            ? `/droply/${userId}/folder/${parentId}`
            : `/droply/${userId}`;

        const originalFileName = file.name;
        const fileExtension = originalFileName.split(".").pop() || "";
        // TODO: check for empty extension
        // TODO: check for not storing exe, php, etc
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;

        const uploadResponse = await imageKit.upload({
            file: fileBuffer,
            fileName: uniqueFilename,
            folder: folderPath,
            useUniqueFileName: false,
        });

        const fileData = {
            name: originalFileName,
            path: uploadResponse.filePath,
            sieze: file.size,
            type: file.type,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl || null,
            userId: userId,
            parentId: parentId,
            isFolder: false,
            isStarred: false,
            isTrash: false,
        };

        const [newFile] = await db.insert(files).values(fileData).returning();

        return NextResponse.json(newFile, { status: 201 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            {
                error: "Failed to upload file",
            },
            { status: 500 },
        );
    }
}
