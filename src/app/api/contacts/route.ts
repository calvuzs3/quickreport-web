import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyRequest(req, "/api/contacts");
}
export async function POST(req: NextRequest) {
  return proxyRequest(req, "/api/contacts");
}