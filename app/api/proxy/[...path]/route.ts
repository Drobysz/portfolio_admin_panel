import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function targetUrl(path: string[], requestUrl: string) {
  const baseUrl = new URL(API_BASE_URL);
  const sourceUrl = new URL(requestUrl);
  const basePath = baseUrl.pathname.replace(/\/$/, "");
  const requestPath = path.map(encodeURIComponent).join("/");

  baseUrl.pathname = `${basePath}/${requestPath}`;
  baseUrl.search = sourceUrl.search;

  return baseUrl;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const headers = new Headers();

  for (const header of ["accept", "authorization", "content-type"]) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const response = await fetch(targetUrl(path, request.url), {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the API server." },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
