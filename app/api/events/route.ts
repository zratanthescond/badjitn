"use server";

import { getAllEvents } from "@/lib/actions/event.actions";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const country = searchParams.get("country") || "";
  const date = searchParams.get("date") || "";
  const result = await getAllEvents({
    page,
    query,
    category,
    country,
    limit: 30,
    date,
  });
  console.log(result);
  console.log("result", result);
  return NextResponse.json(result, { status: 200 });
}
