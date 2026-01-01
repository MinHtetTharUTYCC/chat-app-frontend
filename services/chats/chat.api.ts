import { api } from '@/lib/api';
import {
    ActionRespone,
    JoinGroupResponse,
    LeaveGroupResponse,
    UpdateTitleResponse,
} from '@/types/actions';
import { ChatDetailsResponse, ChatItemResponse, StartChatResponse } from '@/types/chats';
import { UsersResponse } from '@/types/users';

export const startChat = async (otherUserId: string): Promise<StartChatResponse> => {
    const { data } = await api.post('/chats/start', {
        otherUserId,
    });
    return data;
};

export const createGroup = async (title: string, userIds: string[]): Promise<ChatItemResponse> => {
    const { data } = await api.post('/chats/create-group', {
        title,
        userIds,
    });
    return data;
};

export const getChats = async (): Promise<ChatItemResponse[]> => {
    const { data } = await api.get('/chats');
    return data;
};

export const getChatDetails = async (chatId: string): Promise<ChatDetailsResponse> => {
    const { data } = await api.get(`/chats/${chatId}`);
    return data;
};

export const updateTitle = async (chatId: string, title: string): Promise<UpdateTitleResponse> => {
    const { data } = await api.patch(`/chats/${chatId}/update-title`, { title });
    return data;
};
export const leaveGroup = async (chatId: string): Promise<LeaveGroupResponse> => {
    const { data } = await api.delete(`/chats/${chatId}/participants/leave-group`);
    return data;
};
export const joinGroup = async (chatId: string): Promise<JoinGroupResponse> => {
    const { data } = await api.post(`/chats/${chatId}/participants/join-group`);
    return data;
};

//group invites
export const searchUsersToInviteOrAdd = async (
    chatId: string,
    q: string
): Promise<UsersResponse> => {
    const { data } = await api.get(`/chats/${chatId}/invite-users?q=${q}`);
    return data;
};

export const inviteUsers = async (chatId: string, userIds: string[]): Promise<ActionRespone> => {
    const { data } = await api.post(`/chats/${chatId}/participants/invite`, { userIds });
    return data;
};
export const addMembers = async (chatId: string, userIds: string[]): Promise<ActionRespone> => {
    const { data } = await api.post(`/chats/${chatId}/participants`, { userIds });
    return data;
};
