import type { Metadata } from "next";
import UserProfilePage from "@/components/features/social/user-profile-page";

export const metadata: Metadata = {
  title: "User Profile",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserProfilePage userId={id} />;
}
