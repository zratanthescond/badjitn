

import { connectToDatabase } from "@/lib/database";
import Music from "@/lib/database/models/music.model";
import { IUser } from "@/lib/database/models/user.model";
import mongoose, { Mongoose } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const webhookSecret = req.headers.get("x-webhook-secret");
  const expectedSecret = process.env.FILE_SERVER_SECRET || process.env.WEBHOOK_SECRET || "whsec_BMEOzFF0h1hx/pBvNAHoXJVhz/UIJkte";
  
  console.log("[Webhook FileServer] Verifying secret:", {
    hasWebhookSecret: !!webhookSecret,
    expectedSecretSource: process.env.FILE_SERVER_SECRET ? "FILE_SERVER_SECRET" : (process.env.WEBHOOK_SECRET ? "WEBHOOK_SECRET" : "default"),
    matches: webhookSecret === expectedSecret
  });

  if (webhookSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();

  const data = body.metadata;
  //console.log("userId", data.addedBy);
  await connectToDatabase();

  const music = await Music.create({
    title: data.title,
    artist: data.artist,
    album: data.album || "no album",
    path: body.outputPath,
    image: data.thumbnail || "",
    wave: data.wave,
    addedBy: data.addedBy,
  });
  return new Response(JSON.stringify(music), { status: 200 });
}
