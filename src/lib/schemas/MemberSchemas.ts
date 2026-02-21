import * as v from "valibot"

// member
export const MemberSummarySchema = v.object({
    id: v.number(),
    name: v.string(),
    role: v.string(),
});
export type MemberSummary = v.InferOutput<typeof MemberSummarySchema>;
export const DEFAULT_MEMBER_SUMMARY: MemberSummary = {
    id: 0,
    name: "",
    role: "",
};


export const MemberSummaryArraySchema = v.array(MemberSummarySchema);

export const MemberDetailSchema = v.object({
    id: v.number(),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    // add more details when you need them:
    // phone: v.optional(v.string()),
    // createdAt: v.optional(v.string()),
});
export type MemberDetail = v.InferOutput<typeof MemberDetailSchema>;
export const DEFAULT_MEMBER_DETAIL: MemberDetail = {
    id: 0,
    name: "",
    email: "",
    role: "",
};