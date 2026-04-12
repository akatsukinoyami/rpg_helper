import type { SystemEvent } from "./messageEvent";

export interface MessageData {
  id: string;
  content: string | null;
  createdAt: Date | string;
  editedAt?: Date | string | null;
  gmAnnotation?: string | null;
  character?: {
    id?: string | null;
    name: string | null;
    image: string | null;
    hp: number | null;
    maxHp: number | null;
    mp: number | null;
    maxMp: number | null;
  } | null;
  locationName?: string;
  locationId?: string;
  move?:{
    id?: string | null;
    from?: string | null;
    to?: string | null;
  } | null;
  reply?: {
    id?: string | null;
    content?: string | null;
    characterName?: string | null;
  } | null;
  event?: ProposalEvent | null;
}
