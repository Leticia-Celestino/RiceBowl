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
    coverUrl?: string | null;  
    configUrl?: string | null; 
    authorNickname: string;    
    tags: string[];
    createdAt: string;
    gallery?: string[];
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}