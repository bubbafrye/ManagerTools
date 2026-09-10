import { routePartykitRequest } from "partyserver";
import { YServer } from "y-partyserver";
import * as Y from "yjs";

export class YjsServer extends YServer {
  async onLoad() {
    const stored = await this.ctx.storage.get<ArrayBuffer>("ydoc");
    if (stored) Y.applyUpdate(this.document, new Uint8Array(stored));
  }

  async onSave() {
    await this.ctx.storage.put(
      "ydoc",
      Y.encodeStateAsUpdate(this.document),
    );
  }
}

export default {
  async fetch(
    request: Request,
    env: Record<string, unknown>,
  ): Promise<Response> {
    return (
      (await routePartykitRequest(request, env, { cors: true })) ||
      new Response("Not Found", { status: 404 })
    );
  },
};
