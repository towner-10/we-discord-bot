import { MultiSelectPropertyItemObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

export interface NameNotion {
    type: "title";
    title: Array<RichTextItemResponse>;
    id: string;
}

export interface NotesNotion {
    type: "rich_text";
    rich_text: Array<RichTextItemResponse>;
    id: string;
}

export interface TagsNotion {
    type: "multi_select";
    multi_select: Array<MultiSelectPropertyItemObjectResponse>;
    id: string;
}