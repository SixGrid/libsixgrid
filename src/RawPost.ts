export interface IRawPost {
    id?: Number,
    created_at?: string,
    updated_at?: string,
    file?: IRawPostFile,
    preview?: IRawPostPreview,
    sample?: IRawPostSample,
    score?: IRawPostScore,
    tags?: IRawPostTags,
    locked_tags?: string[],
    change_seq?: Number,
    flags?: IRawPostFlags,
    rating?: string,
    fav_count?: Number,
    sources?: string[],
    pools?: Number[],
    relationships?: IRawPostRelationships,
    approver_id?: Number,
    uploader_id?: Number,
    description?: string,
    comment_count?: Number,
    is_favorited?: boolean,
    has_notes?: boolean,
    duration?: Number
}

export interface IRawPostFile extends IRawPostPreview {
    ext: string,
    size: Number,
    md5: string
}
export interface IRawPostPreview {
    width: Number,
    height: Number,
    url?: string
}
export interface IRawPostSample extends IRawPostPreview {
    has: boolean,
    alternatives: any
}

export interface IRawPostScore {
    up: Number,
    down: Number,
    total: Number
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
    parent_id?: Number,
    has_children: boolean,
    has_active_children: boolean,
    children?: Number[]
}