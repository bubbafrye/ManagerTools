import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

export default class YjsServer implements Party.Server {
  constructor(public room: Party.Room) {}

  onConnect(connection: Party.Connection) {
    return onConnect(connection, this.room, {
      persist: { mode: "snapshot" },
    });
  }
}
