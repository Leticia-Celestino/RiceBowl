export interface UserDTO {
    id: string;
    nickname: string;
    avatarUrl?: string;
}

export interface RiceDTO {
    id: string;
    title: string;
    description: string;
    coverImageUrl?: string;
    tags: string[];
    author: UserDTO;
    createdAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}