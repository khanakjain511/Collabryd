import { useEffect, useRef, useState, type FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import {
  conversationsApi,
  type BackendConversation,
  type BackendMessage,
} from "../lib/api";
import { Avatar, Badge, Icon, PageHeading } from "../components/ui";

export function MessagesPage({
  conversationId: activeConvIdFromRoute,
  demo,
}: {
  conversationId?: string;
  demo: DemoData;
}) {
  const [conversations, setConversations] = useState<BackendConversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeConvId, setActiveConvId] = useState<number | null>(
    activeConvIdFromRoute ? Number(activeConvIdFromRoute) : null
  );
  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations list
  async function loadConversations() {
    try {
      const list = await conversationsApi.list();
      setConversations(list);
      if (!activeConvId && list.length > 0 && !activeConvIdFromRoute) {
        setActiveConvId(list[0]!.conversationId);
      }
    } catch {
      // Fallback or offline
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  // Update activeConvId when route changes
  useEffect(() => {
    if (activeConvIdFromRoute) {
      setActiveConvId(Number(activeConvIdFromRoute));
    }
  }, [activeConvIdFromRoute]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    conversationsApi
      .listMessages(activeConvId, { limit: 50 })
      .then((res) => {
        setMessages(res.items);
        // Mark conversation as read
        if (res.items.length > 0) {
          const lastSeq = res.items[res.items.length - 1]!.sequenceNumber;
          conversationsApi.markRead(activeConvId, lastSeq).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
  }, [activeConvId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodic polling for new messages when open
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => {
      conversationsApi
        .listMessages(activeConvId, { limit: 50 })
        .then((res) => {
          setMessages(res.items);
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  const activeConversation = conversations.find(
    (c) => c.conversationId === activeConvId
  );

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeConvId || sending) return;

    const content = text.trim();
    setText("");
    setSending(true);

    // Optimistic message
    const tempId = crypto.randomUUID();
    const optimisticMessage: BackendMessage = {
      messageId: Date.now(),
      conversationId: activeConvId,
      senderId: demo.currentUserId || 0,
      senderName: demo.profile.name,
      senderAvatarUrl: null,
      clientMessageId: tempId,
      sequenceNumber: (messages[messages.length - 1]?.sequenceNumber || 0) + 1,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((curr) => [...curr, optimisticMessage]);

    try {
      const res = await conversationsApi.sendMessage(activeConvId, content, tempId);
      if (res && res.message) {
        setMessages((curr) =>
          curr.map((m) =>
            m.clientMessageId === tempId ? { ...res.message, senderName: demo.profile.name } : m
          )
        );
      }
    } catch {
      // Keep optimistic message or handle error
    } finally {
      setSending(false);
    }
  }

  function getConversationTitle(conv: BackendConversation): string {
    if (conv.type === "PROJECT_GROUP") {
      return conv.projectTitle || "Team Project Chat";
    }
    const otherParticipant = conv.participants.find(
      (p) => p.userId !== demo.currentUserId
    );
    return otherParticipant?.displayName || "Direct Message";
  }

  return (
    <>
      <PageHeading
        eyebrow="COMMUNICATION & COLLABORATION"
        title="Messages"
        description="Connect directly with peers, team members, and collaborators across campus."
      />

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[600px] mb-10">
        {/* Left column: Conversations sidebar */}
        <aside className="border-r border-border flex flex-col bg-surface/50">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wider uppercase text-muted">
              Inbox
            </h2>
            <Badge tone="neutral">{conversations.length}</Badge>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-border/60">
            {loadingList ? (
              <div className="p-6 text-center text-sm text-muted">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-soft grid place-items-center text-muted">
                  <Icon name="mail" size={20} />
                </span>
                <p className="text-sm text-muted">No conversations yet.</p>
                <a
                  href="#/discover"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Find people to message
                </a>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.conversationId === activeConvId;
                const title = getConversationTitle(conv);
                const isGroup = conv.type === "PROJECT_GROUP";

                return (
                  <button
                    key={conv.conversationId}
                    type="button"
                    onClick={() => {
                      setActiveConvId(conv.conversationId);
                      window.location.hash = `/messages/${conv.conversationId}`;
                    }}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-sage/40 border-l-4 border-primary"
                        : "hover:bg-soft"
                    }`}
                  >
                    <Avatar
                      name={title}
                      color={isGroup ? "#115e59" : "#6b46c1"}
                      small
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <strong className="text-sm font-semibold text-ink truncate">
                          {title}
                        </strong>
                        {conv.unreadMessagesCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-accent text-on-accent text-[11px] font-bold grid place-items-center">
                            {conv.unreadMessagesCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted truncate">
                        {isGroup ? "Project group chat" : "Direct message"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right column: Message thread */}
        <section className="flex flex-col h-[600px] bg-surface">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface/70">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={getConversationTitle(activeConversation)}
                    color={
                      activeConversation.type === "PROJECT_GROUP"
                        ? "#115e59"
                        : "#6b46c1"
                    }
                    small
                  />
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      {getConversationTitle(activeConversation)}
                    </h3>
                    <p className="text-xs text-muted">
                      {activeConversation.type === "PROJECT_GROUP"
                        ? `Project Team · ${activeConversation.participants.length} members`
                        : "Direct conversation"}
                    </p>
                  </div>
                </div>
                {activeConversation.projectId && (
                  <a
                    href={`#/teams/${activeConversation.projectId}`}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View team project <Icon name="arrowUp" size={14} />
                  </a>
                )}
              </div>

              {/* Messages feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-soft/30">
                {loadingMessages ? (
                  <div className="p-8 text-center text-sm text-muted">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center text-muted text-sm">
                    No messages in this conversation yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId === demo.currentUserId;
                    return (
                      <div
                        key={msg.clientMessageId || msg.messageId}
                        className={`flex flex-col ${
                          isSelf ? "items-end" : "items-start"
                        }`}
                      >
                        {!isSelf && (
                          <span className="text-[11px] font-semibold text-muted mb-1 px-1">
                            {msg.senderName}
                          </span>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs ${
                            isSelf
                              ? "bg-accent text-on-accent rounded-br-xs"
                              : "bg-surface border border-border text-ink rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send message form */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-border flex items-center gap-2 bg-surface"
              >
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 py-2.5 px-3.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <span>Send</span>
                  <Icon name="arrowUp" size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <span className="w-14 h-14 rounded-full bg-soft grid place-items-center text-muted mb-4">
                <Icon name="mail" size={28} />
              </span>
              <h3 className="text-lg font-bold text-ink mb-2">
                Select a conversation
              </h3>
              <p className="text-sm text-muted max-w-sm mb-6">
                Pick a conversation from the sidebar or reach out to other students on discovery or team pages.
              </p>
              <a
                href="#/discover"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors"
              >
                Browse students <Icon name="arrow" size={16} />
              </a>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
