// src/types/rice.ts
export interface UserDTO {
    id: string;
    nickname: string;
    avatarUrl?: string;
}

export interface RiceDTO {
    id: string;
    title: string;
    description: string;
    distro: string;
    windowManager: string;
    coverUrl: string;
    configUrl?: string;
    authorNickname: string;
    tags: string[];
    createdAt: string;
    karma: number;
    comments?: CommentDTO[]; 
    commentCount?: number;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface CommentDTO {
    id: string;
    content: string;
    authorNickname: string;
    createdAt: string;
}
