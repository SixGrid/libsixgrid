export interface IRawPost {
    id?: number,
    created_at?: string,
    updated_at?: string,
    file?: IRawPostFile,
    preview?: IRawPostPreview,
    sample?: IRawPostSample,
    score?: IRawPostScore,
    tags?: IRawPostTags,
    locked_tags?: string[],
    change_seq?: number,
    flags?: IRawPostFlags,
    rating?: string,
    fav_count?: number,
    sources?: string[],
    pools?: number[],
    relationships?: IRawPostRelationships,
    approver_id?: number,
    uploader_id?: number,
    description?: string,
    comment_count?: number,
    is_favorited?: boolean,
    has_notes?: boolean,
    duration?: number
}

export interface IRawPostFile extends IRawPostPreview {
    ext: string,
    size: number,
    md5: string
}
export interface IRawPostPreview {
    width: number,
    height: number,
    url?: string
}
export interface IRawPostSample extends IRawPostPreview {
    has: boolean,
    alternatives: any
}

export interface IRawPostScore {
    up: number,
    down: number,
    total: number
}
export interface IRawPostTags {
    general: string[],
    species: string[],
    character: string[],
    copyright: string[],
    artist: string[],
    invalid: string[],
    lore: string[],
    meta: string[]
}

export interface IRawPostFlags {
    pending: boolean,
    flagged: boolean,
    note_locked: boolean,
    status_locked: boolean,
    rating_locked: boolean,
    deleted: boolean
}

export interface IRawPostRelationships {
    parent_id?: number,
    has_children: boolean,
    has_active_children: boolean,
    children?: number[]
}