"use client";

import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { subscribeToMessages, sendMessage } from "@/lib/friends";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Pencil, Trash2, Check, X, Pin } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

export default function ChatInterface() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;
  const authUser = auth.currentUser;
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  useEffect(() => {
    // Use the listener instead of the static authUser variable
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("User profile fetched:", data);
            setUser(data);
          } else {
            console.warn("No Firestore document found for this UID.");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      console.log(msgs);

      setTimeout(
        () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage;
    setNewMessage("");
    await sendMessage(chatId, text, {
      name: user.username,
      photo: user.photoURL,
    });
  };

  const deleteMessage = async (chatId: string, messageId: string) => {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  // const pinMessage = async (text: string) => {
  //   const messagesRef = collection(db, "chats", chatId, "pinnedMessage");

  //   await addDoc(messagesRef, {
  //     senderName: user.username,
  //     senderPhoto: user.photoURL,
  //     text,
  //     timestamp: serverTimestamp(),
  //   });
  // };

  const pinMessage = async (name: string, photo: string, text: string) => {
    const pinnedRef = doc(db, "chats", chatId, "pinnedMessage", "current");

    await setDoc(pinnedRef, {
      senderName: name,
      senderPhoto: photo,
      text,
      timestamp: serverTimestamp(),
    });
  };

  const editMessage = async (
    chatId: string,
    messageId: string,
    newText: string,
  ) => {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(messageRef, {
        text: newText,
        isEdited: true,
      });
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleStartEdit = (msg: any) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    await editMessage(chatId, msgId, editText);
    setEditingId(null);
  };

  function groupMessage() {
    let lastSender: string = "";
    return messages.map((msg) => {
      let data = (
        <div
          key={msg.id}
          className="relative flex items-start gap-4 group hover:bg-[#111111] -mx-4 px-4 py-1 transition-colors"
        >
          {(user?.username === msg.senderName || true) && (
            <div className="absolute top-0 right-4 hidden group-hover:flex gap-1 bg-[#1d1d1d] border border-white/10 rounded-md shadow-lg p-1 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                onClick={() =>
                  pinMessage(msg.senderName, msg.senderPhoto, msg.text)
                }
              >
                <Pin className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                onClick={() => handleStartEdit(msg)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                onClick={() => deleteMessage(chatId, msg.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {lastSender != msg.senderName ? (
            <Avatar className="w-10 h-10 mt-1">
              <AvatarImage src={msg.senderPhoto} />
              <AvatarFallback className="bg-indigo-500 text-white">
                {msg.senderName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="px-5"> </div>
          )}
          <div className="flex flex-col flex-1">
            {lastSender != msg.senderName && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  {msg.senderName}
                </span>
                <span className="text-xs text-zinc-500">
                  {msg.timestamp?.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {msg.isEdited && (
                    <span className="ml-1 text-[10px] italic">(edited)</span>
                  )}
                </span>
              </div>
            )}
            {editingId === msg.id ? (
              <div className="mt-1 flex flex-col gap-2">
                <input
                  className="bg-[#2b2d31] text-white p-2 rounded-md outline-none w-full border border-indigo-500"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => handleSaveEdit(msg.id)}
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-zinc-500 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[#dbdee1] leading-relaxed break-words overflow-hidden">
                <ReactMarkdown
                  components={{
                    // Headers
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold border-b border-zinc-700 pb-1 mt-2 mb-1 text-white">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mt-2 mb-1 text-white">
                        {children}
                      </h2>
                    ),

                    // Bold/Italic
                    strong: ({ children }) => (
                      <strong className="font-bold text-white">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),

                    // Links
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00a8fc] hover:underline"
                      >
                        {children}
                      </a>
                    ),

                    // Lists
                    ul: ({ children }) => (
                      <ul className="list-disc ml-5 space-y-1 my-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal ml-5 space-y-1 my-1">
                        {children}
                      </ol>
                    ),

                    // Code Blocks
                    code: ({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: any) => {
                      return inline ? (
                        <code
                          className="bg-[#2e3035] px-1.2 rounded text-sm font-mono text-[#e3e5e8]"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-[#1e1f22] p-3 rounded-md border border-black/20 my-2 overflow-x-auto">
                          <code
                            className="text-sm font-mono text-[#dbdee1]"
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      );
      lastSender = msg.senderName;
      return data;
    });
  }

  const [isFocused, setIsFocused] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevMsgCount = useRef(messages.length);

  useEffect(() => {
    audioRef.current = new Audio("/ping.mp3");
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const [pinnedMsg, setPinnedMsg] = useState<any>(null);

  // Fetch the pinned message in real-time
  useEffect(() => {
    const pinnedRef = doc(db, "chats", chatId, "pinnedMessage", "current");
    const unsubscribe = onSnapshot(pinnedRef, (docSnap) => {
      console.log("pinned", docSnap);

      if (docSnap.exists()) {
        setPinnedMsg({ id: docSnap.id, ...docSnap.data() });
      } else {
        setPinnedMsg(null);
      }
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const lastMsg = messages[messages.length - 1];
      if (!isFocused && lastMsg.senderName !== user?.username) {
        audioRef.current
          ?.play()
          .catch((err) => console.log("Audio play blocked by browser:", err));
      }
    }
    prevMsgCount.current = messages.length;
  }, [messages, isFocused, user?.username]);

  return (
    <>
      <Navbar></Navbar>

      <div className="flex flex-col h-screen bg-black text-[#dbdee1] ">
        <ScrollArea className="flex-1 px-4 mt-15 bg-black pb-5">
          <div className="py-6">
            {groupMessage()}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        {/* Input Bar */}
        <div className="fixed bottom-0 w-screen">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-[#111111] rounded-lg px-4 py-2 shadow-inner"
          >
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Pin className="w-6 h-6" />
                </button>
              </DialogTrigger>

              <DialogContent className="bg-[#1e1f22] border-zinc-800 text-[#dbdee1] sm:max-w-106.25">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    <Pin className="w-4 h-4 text-indigo-400" />
                    Pinned Messages
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {pinnedMsg ? (
                    <div className="bg-[#2b2d31] p-3 rounded-md border border-white/5 relative group">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={pinnedMsg.senderPhoto} />
                          <AvatarFallback className="text-[10px] bg-indigo-500">
                            {pinnedMsg.senderName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-white">
                          {pinnedMsg.senderName}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {pinnedMsg.timestamp?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {pinnedMsg.text}
                      </p>

                      {/* Optional: Button to unpin */}
                      <button
                        onClick={() =>
                          deleteDoc(
                            doc(
                              db,
                              "chats",
                              chatId,
                              "pinnedMessage",
                              "current",
                            ),
                          )
                        }
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Pin className="w-12 h-12 text-zinc-700 mx-auto mb-2 opacity-20" />
                      <p className="text-zinc-500 text-sm">
                        No pinned messages yet.
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message"
              className="flex-1 bg-[#1d1d1d] border-none outline-none rounded-lg p-2 px-4 focus-visible:ring-0 text-[#dbdee1] placeholder:text-zinc-500"
            />

            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="hover:bg-[#1d1d1d] text-zinc-400 hover:text-white"
            >
              <SendHorizontal className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
