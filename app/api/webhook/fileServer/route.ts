"use sever";

import { connectToDatabase } from "@/lib/database";
import Music from "@/lib/database/models/music.model";
import { IUser } from "@/lib/database/models/user.model";
import mongoose, { Mongoose } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();

  const data = body.metadata;
  //console.log("userId", data.addedBy);
  await connectToDatabase();

  const music = await Music.create({
    title: data.title,
    artist: data.artist,
    album: data.album,
    path: body.outputPath,
    image: data.thumbnail,
    wave: data.wave,
    addedBy: data.addedBy,
  });
  return new Response(JSON.stringify(music), { status: 200 });
}
