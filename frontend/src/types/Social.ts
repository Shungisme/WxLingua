export type RelationshipStatus =
  | "self"
  | "friend"
  | "outgoing_pending"
  | "incoming_pending"
  | "none";

export interface CursorResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface SocialUser {
  id: string;
  name: string | null;
  avatar: string | null;
  email?: string;
  createdAt: string;
  relationshipStatus?: RelationshipStatus;
}

export interface UserProfile {
  id: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  relationshipStatus: RelationshipStatus;
  email?: string;
}

export interface FriendRequestItem {
  id: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";
  createdAt: string;
  updatedAt: string;
  sender?: SocialUser;
  receiver?: SocialUser;
}

export interface FriendshipItem {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
  friend: SocialUser;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name: string | null;
  avatar: string | null;
  participantIds: string[];
  directKey: string | null;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    name: string | null;
    avatar: string | null;
    email?: string;
  }>;
  lastMessage?: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  } | null;
}
