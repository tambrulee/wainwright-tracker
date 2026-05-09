import { NextResponse } from "next/server";
import { getAreaWeather } from "@/lib/weather/getAreaWeather";

export async function GET() {
  const weather = await getAreaWeather();

  return NextResponse.json({
    weather,
  });
}