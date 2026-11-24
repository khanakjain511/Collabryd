import type { Socket } from "socket.io-client";

// Events are wake-ups. Serialize reads and remember wake-ups received during a read.
export function watchChat(socket: Socket, conversationId: number | null,
  read: (signal: AbortSignal) => Promise<void>, onError: (error: unknown) => void) {
  const controller = new AbortController();
  let running = false;
  let dirty = false;

  async function sync() {
    dirty = true;
    if (running || controller.signal.aborted) return;
    running = true;
    try {
      do {
        dirty = false;
        await read(controller.signal);
      } while (dirty && !controller.signal.aborted);
    } catch (error) {
      if (!controller.signal.aborted) onError(error);
    } finally {
      running = false;
    }
  }

  function onConnect() {
    if (conversationId !== null && socket.connected) {
      // Read again after joining to close the read/subscribe gap.
      socket.timeout(5000).emit("conversation:join", conversationId, () => void sync());
    }
    void sync();
  }
  function onMessage(id: number) {
    if (conversationId === null || conversationId === id) void sync();
  }
  function onVisible() {
    if (document.visibilityState === "visible") void sync();
  }

  socket.on("connect", onConnect);
  socket.on("conversation:changed", onMessage);
  socket.on("chat:sync", onConnect);
  if (conversationId === null) socket.on("inbox:changed", sync);
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("online", onConnect);
  // Also recover from a missed DB notification or an unavailable socket transport.
  const timer = window.setInterval(onVisible, 60000);
  onConnect();
  return {
    sync,
    close() {
      controller.abort();
      clearInterval(timer);
      socket.off("connect", onConnect);
      socket.off("chat:sync", onConnect);
      socket.off("conversation:changed", onMessage);
      socket.off("inbox:changed", sync);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onConnect);
      if (conversationId !== null && socket.connected) socket.emit("conversation:leave", conversationId);
    },
  };
}
