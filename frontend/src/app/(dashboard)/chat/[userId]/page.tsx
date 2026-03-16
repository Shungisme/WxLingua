import type { Metadata } from "next";
import DirectChatPage from "@/components/features/social/direct-chat-page";

export const metadata: Metadata = {
  title: "Direct Chat",
};

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <DirectChatPage userId={userId} />;
}
