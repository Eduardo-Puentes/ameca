import axios from "axios";
import { getJSON } from "../http";

import { 
    MemberSummaryArraySchema, type MemberSummary, 
    MemberDetailSchema,  type MemberDetail
} from "../schemas/MemberSchemas";

import { parseOrThrow } from "../Parse";

export async function fetchMembersService(): Promise<MemberSummary[]> {
    const raw = await getJSON<undefined>("/api/members");
    return parseOrThrow(MemberSummaryArraySchema, raw);
}

export async function fetchMemberByIdService(id: number): Promise<MemberDetail> {
    const raw = await getJSON<undefined>(`/api/members/${id}`);
    return parseOrThrow(MemberDetailSchema, raw);
}