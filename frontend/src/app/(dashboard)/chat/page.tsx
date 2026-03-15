import type { Metadata } from "next";
import ChatConversationsPage from "@/components/features/social/chat-conversations-page";

export const metadata: Metadata = {
  title: "Chat",
};

export default function Page() {
  return <ChatConversationsPage />;
}
