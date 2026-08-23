import { api } from "./api";

export interface Thread {
  partner: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };

  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;

  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;

  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

class MessageService {
  async getThreads() {
    const res = await api.get<{
      success: boolean;
      data: Thread[];
    }>("/messages");

    return res.data;
  }

  async getConversation(partnerId: string, page = 1) {
    const res = await api.get<{
      success: boolean;
      data: {
        items: Message[];
        total: number;
      };
    }>(`/messages/${partnerId}?page=${page}`);

    return res.data;
  }

  async sendMessage(receiverId: string, content: string) {
    const res = await api.post<{
      success: boolean;
      data: Message;
    }>("/messages", {
      receiverId,
      content,
    });

    return res.data;
  }

  async getUnreadCount() {
    const res = await api.get<{
      success: boolean;
      data: {
        unreadCount: number;
      };
    }>("/messages/unread");

    return res.data.unreadCount;
  }
}

export default new MessageService();
