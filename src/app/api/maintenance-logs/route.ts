import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyRequest(req, "/api/maintenance-logs");
}
export async function POST(req: NextRequest) {
  return proxyRequest(req, "/api/maintenance-logs");
}