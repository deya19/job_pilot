import { createRefreshAuthRouter } from "@insforge/sdk/ssr";

const refreshRouter = createRefreshAuthRouter();

export async function POST(request: Request): Promise<Response> {
  return refreshRouter.POST(request);
}
