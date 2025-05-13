import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";

// imageKit initialization
const imageKit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Fetch all trashed files for the user
    const trashedFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    if (trashedFiles.length === 0) {
      return NextResponse.json(
        { message: "No trashed files found" },
        { status: 404 }
      );
    }

    // Delete the files from imageKit
    for (const file of trashedFiles) {
      if (!file.isFolder) {
        try {
          let imagekitFileId = null;
          if (file.fileUrl) {
            const urlWithoutQuery = file.fileUrl.split("?")[0];
            imagekitFileId = urlWithoutQuery?.split("/").pop();
          }

          if (!imagekitFileId && file.path) {
            imagekitFileId = file.path.split("/").pop();
          }

          if (imagekitFileId) {
            await imageKit.deleteFile(imagekitFileId);
          }
        } catch (error) {
          console.error(`Error deleting file ${file.id} from imageKit:`, error);
        }
      }
    }

    // Delete trashed file from database
    const deletedFiles = await db
      .delete(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Trashed files deleted successfully",
      deletedFiles,
    });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json(
      {
        error: "Failed to empty trash",
      },
      { status: 500 }
    );
  }
}
