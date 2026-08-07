// انطباق یافته با ConversationListItemDto در بک‌اند
export type Conversation = {
    id: string;
    contactId: string;
    contactName: string;
    contactPhoneNumber: string;
    status: number; // مثلا 1: Open, 2: Closed
    statusName: string;
    assigneeUserId?: string;
    createdAt: string;
    platform?: string; // یا channel
    lastMessage?: string;
    time?: string;
    unreadCount?: number;
    isPrivateChat?: boolean; 
    chatName?: string;
    tags?: { id: string; title: string; color?: string }[];
    contactUserNameInPlatform: string;
    lastMessageDate?: string;
};

// انطباق یافته با MessageDto در بک‌اند
export type Message = {
    id: string;
    conversationId: string;
    direction: number; // 1: Incoming (کاربر), 2: Outgoing (اپراتور/بات)
    directionName: string;
    type: number; // 1: Text, 2: Image, 3: Video, ...
    typeName: string;
    status: number;
    statusName: string;
    textContent?: string;
    mediaUrl?: string;
    externalMessageId?: string;
    senderUserId?: string;
    senderName?: string;
    createdAt: string;
};

// مدل ورودی برای ارسال پیام منطبق با SendOutgoingMessageCommand
export type SendMessagePayload = {
    conversationId: string;
    companyId: string;
    senderUserId: string;
    messageType: number;
    textContent?: string;
    mediaUrl?: string;
};

export type CannedResponse = {
    id: string;
    trigger: string;
    text: string;
}