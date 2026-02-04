"use client";

import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { subscribeToMessages, sendMessage } from "@/lib/friends";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  SendHorizontal,
  PlusCircle,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";

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
    const fetchProfile = async () => {
      if (authUser) {
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        if (userDoc.exists()) {
          let data = userDoc.data();
          console.log(data);
          setUser(data);
        }
      }
    };
    fetchProfile();
  }, [authUser]);

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

  return <>
    <Navbar></Navbar>
    <div className="flex flex-col h-screen bg-black text-[#dbdee1] ">
      <ScrollArea className="flex-1 px-4 mt-15">
        <div className="py-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="relative flex items-start gap-4 group hover:bg-[#111111] -mx-4 px-4 py-1 transition-colors"
            >
              {/* {user?.username === msg.senderName && ( */}
                <div className="absolute top-0 right-4 hidden group-hover:flex gap-1 bg-[#1d1d1d] border border-white/10 rounded-md shadow-lg p-1 z-10">
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
              {/* )} */}

              <Avatar className="w-10 h-10 mt-1">
                <AvatarImage src={msg.senderPhoto} />
                <AvatarFallback className="bg-indigo-500 text-white">
                  {msg.senderName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col flex-1">
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
                  <p className="text-[#dbdee1] leading-relaxed">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      {/* Input Bar */}
      <div className="px-4 pb-6 bg-black">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-[#111111] rounded-lg px-4 py-2 shadow-inner"
        >
          <button type="button" className=" text-zinc-400 hover:text-zinc-200">
            <PlusCircle className="w-6 h-6" />
          </button>

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
  </>;
}
