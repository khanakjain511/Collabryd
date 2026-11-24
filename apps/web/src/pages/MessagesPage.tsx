import { useEffect, useRef, useState, type FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { conversationsApi, type BackendConversation, type BackendMessage } from "../lib/api";
import { watchChat } from "../lib/chat-sync";
import { Avatar, Badge, PageHeading } from "../components/ui";

const PAGE = 50;
const action = "px-3 py-2 rounded-lg text-sm font-semibold text-primary hover:bg-soft";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Could not reach messaging.";

function accessEnded(error: unknown) {
  return error instanceof Error && "status" in error && [401, 403, 404].includes(Number(error.status));
}

function title(conv: BackendConversation, userId?: number) {
  return conv.type === "GROUP" ? conv.projectTitle || "Team chat"
    : conv.participants.find((p) => p.userId !== userId)?.displayName || "Direct message";
}

function mergeMessages(previous: BackendMessage[], incoming: BackendMessage[]) {
  const byId = new Map(previous.map((m) => [m.messageId, m]));
  for (const message of incoming) byId.set(message.messageId, message);
  return [...byId.values()].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
}

export function MessagesPage({ conversationId, demo }: { conversationId?: string; demo: DemoData }) {
  const { liveSocket: socket, currentUserId } = demo;
  const [inbox, setInbox] = useState<BackendConversation[]>();
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(socket.connected);
  const retry = useRef<() => void>(() => {});
  useEffect(() => {
    const status = () => setConnected(socket.connected);
    socket.on("connect", status).on("disconnect", status);
    const watch = watchChat(socket, null, async (signal) => {
      const rows = await conversationsApi.list();
      if (signal.aborted) return;
      setInbox(rows);
      setError("");
      status();
    }, (err) => {
      if (accessEnded(err)) setInbox([]);
      setError(errorText(err));
    });
    retry.current = watch.sync;
    return () => {
      watch.close();
      socket.off("connect", status).off("disconnect", status);
    };
  }, [socket]);

  const selected = conversationId ? inbox?.find((c) => c.conversationId === Number(conversationId)) : inbox?.[0];
  return <>
    <PageHeading eyebrow="Workspace" title="Messages" description="Direct conversations and project team chats." />
    <div className="bg-surface border border-border rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[minmax(220px,30%)_1fr] mb-10">
      <aside aria-label="Conversation inbox" className="border-b md:border-r border-border">
        <div className="p-4 flex items-center justify-between">
          <h2 className="font-semibold">Inbox</h2>
          <span role="status" className="text-xs text-muted">{connected ? "Live" : "Reconnecting…"}</span>
        </div>
        {error && <p role="alert" className="px-4 text-danger">{error} <button className={action} onClick={() => retry.current()}>Retry inbox</button></p>}
        {!inbox && !error && <p className="p-4">Loading conversations…</p>}
        {inbox?.length === 0 && <p className="p-4 text-muted">No conversations yet.</p>}
        <nav aria-label="Conversations" className="max-h-48 md:max-h-[55vh] overflow-y-auto">
          {inbox?.map((conv) => <a key={conv.conversationId} href={`#/messages/${conv.conversationId}`}
            aria-current={selected?.conversationId === conv.conversationId ? "page" : undefined}
            className="flex items-center gap-3 p-3 hover:bg-soft aria-[current=page]:bg-sage/40">
            <Avatar name={title(conv, currentUserId)} color={conv.type === "GROUP" ? "#115e59" : "#6b46c1"} small />
            <span className="flex-1 min-w-0 truncate">{title(conv, currentUserId)}</span>
            {conv.unreadMessagesCount > 0 && <Badge tone="neutral">{conv.unreadMessagesCount} unread</Badge>}
          </a>)}
        </nav>
        <a href="#/discover" className={action + " inline-block m-2"}>Find students to message</a>
      </aside>
      {selected ? <Thread key={selected.conversationId} conv={selected} demo={demo} /> :
        <p className="p-8 text-muted">{conversationId && inbox ? "Conversation unavailable." : "Select a conversation."}</p>}
    </div>
  </>;
}

function Thread({ conv, demo }: { conv: BackendConversation; demo: DemoData }) {
  const id = conv.conversationId;
  const { liveSocket: socket } = demo;
  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [older, setOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const pending = useRef<{ clientMessageId: string; content: string } | null>(null);
  const sendLock = useRef(false);
  const sync = useRef<() => void>(() => {});
  const feed = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const initialRead = useRef(conv.lastReadSequence);

  useEffect(() => {
    let cursor: number | undefined;
    let readThrough = initialRead.current;
    const watch = watchChat(socket, id, async (signal) => {
      let page: BackendMessage[];
      do {
        const initial = cursor === undefined;
        page = await conversationsApi.listMessages(id, { afterSequence: cursor, limit: PAGE });
        if (signal.aborted) return;
        if (initial) setOlder(page.length === PAGE);
        if (page.length) {
          const batch = page;
          setMessages((prev) => mergeMessages(prev, batch));
          if (batch.some((m) => m.clientMessageId === pending.current?.clientMessageId)) {
            pending.current = null;
            setFailed(false);
            setText("");
          }
        }
        cursor = page.at(-1)?.sequenceNumber ?? cursor ?? 0;
        if (initial) break;
      } while (page.length === PAGE);
      setLoading(false);
      setError("");
      if (document.visibilityState === "visible" && cursor > readThrough) {
        const result = await conversationsApi.markRead(id, cursor);
        readThrough = result.lastReadSequence;
      }
    }, (err) => {
      if (accessEnded(err)) {
        setMessages([]);
        setOlder(false);
        cursor = undefined;
        readThrough = 0;
      }
      setError(errorText(err));
      setLoading(false);
    });
    sync.current = watch.sync;
    return watch.close;
  }, [id, socket]);

  const latest = messages.at(-1)?.sequenceNumber;
  useEffect(() => {
    if (follow.current && feed.current) feed.current.scrollTop = feed.current.scrollHeight;
  }, [latest]);

  async function loadOlder() {
    if (!messages.length || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await conversationsApi.listMessages(id, { beforeSequence: messages[0].sequenceNumber, limit: PAGE });
      setMessages((prev) => mergeMessages(prev, page));
      setOlder(page.length === PAGE);
      setError("");
    } catch (err) { setError(errorText(err)); }
    finally { setLoadingOlder(false); }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (sendLock.current || !text.trim()) return;
    const request = pending.current ?? { content: text.trim(), clientMessageId: crypto.randomUUID() };
    pending.current = request;
    sendLock.current = true;
    setSending(true);
    setFailed(false);
    try {
      const row = await conversationsApi.sendMessage(id, request.content, request.clientMessageId);
      const message = { ...row, senderName: demo.profile.name, senderAvatarUrl: null };
      follow.current = true;
      setMessages((prev) => mergeMessages(prev, [message]));
      pending.current = null;
      setText("");
      sync.current();
    } catch (err) {
      if (pending.current) {
        setFailed(true);
        setError(errorText(err));
      }
    } finally {
      sendLock.current = false;
      setSending(false);
    }
  }

  return <section className="min-w-0 flex flex-col h-[65vh] min-h-80">
    <header className="flex justify-between items-center gap-3 p-4 border-b border-border">
      <h2 className="font-semibold">{title(conv, demo.currentUserId)}</h2>
      {conv.projectId && <a className={action} href={`#/teams/${conv.projectId}`}>View team</a>}
    </header>
    {error && <p role="alert" className="px-4 text-danger">{error} <button className={action} onClick={() => sync.current()}>Reload history</button></p>}
    <div ref={feed} aria-label="Message history" className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-soft/30"
      onScroll={(e) => { const el = e.currentTarget; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 64; }}>
      {older && <button className={action} onClick={loadOlder} disabled={loadingOlder}>{loadingOlder ? "Loading…" : "Load older messages"}</button>}
      {loading && <p>Loading messages…</p>}
      {!loading && !error && messages.length === 0 && <p className="text-muted">No messages yet. Say hello!</p>}
      {messages.map((m) => {
        const own = m.senderId === demo.currentUserId;
        return <article key={m.messageId} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
          <span className="text-xs text-muted">{own ? "You" : m.senderName}</span>
          <p className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 ${own ? "bg-accent text-on-accent" : "bg-surface border border-border"}`}>{m.content}</p>
          <time className="text-xs text-muted" dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString()}</time>
        </article>;
      })}
    </div>
    {failed && <p role="status" className="px-3 text-sm">Send unconfirmed. Retry to check delivery.</p>}
    <form onSubmit={send} className="flex gap-2 p-3 border-t border-border">
      <input aria-label="Message" placeholder="Type a message…" maxLength={4000} value={text} readOnly={sending}
        onChange={(e) => { pending.current = null; setFailed(false); setText(e.target.value); }}
        className="flex-1 min-w-0 border border-input-border bg-surface rounded-lg px-3 py-2" />
      <button disabled={!text.trim() || sending} className="bg-accent text-on-accent font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
        {sending ? "Sending…" : failed ? "Retry send" : "Send"}
      </button>
    </form>
  </section>;
}
