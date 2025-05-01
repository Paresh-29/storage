import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imageKit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }

        const authParams = imageKit.getAuthenticationParameters();

        return NextResponse.json(authParams);
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to get authentication parameters for imageKit",
            },
            { status: 500 },
        );
    }
}
