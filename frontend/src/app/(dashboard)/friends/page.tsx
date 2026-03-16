import type { Metadata } from "next";
import UsersSearchPage from "@/components/features/social/users-search-page";

export const metadata: Metadata = {
  title: "Users & Friends",
};

export default function Page() {
  return <UsersSearchPage />;
}
