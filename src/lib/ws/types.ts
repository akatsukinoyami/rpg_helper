export type WsEvent =
	| { type: 'game:updated'; payload: GameUpdatedPayload }
	| { type: 'message:created'; payload: MessageCreatedPayload }
	| { type: 'message:edited'; payload: MessageEditedPayload }
	| { type: 'message:deleted'; payload: { messageId: string } }
	| { type: 'character:moved'; payload: CharacterMovedPayload }
	| { type: 'character:stat'; payload: CharacterStatPayload }
	| { type: 'character:item'; payload: CharacterItemPayload }
	| { type: 'dice:roll'; payload: DiceRollPayload }
	| { type: 'location:revealed'; payload: { locationId: string } };

export type WsEventType = WsEvent['type'];
export type WsEventPayload<T extends WsEventType> = Extract<WsEvent, { type: T }>['payload'];

export interface GameUpdatedPayload {
	name: string;
	description: string | null;
	image: string | null;
	hpLabel: string;
	mpLabel: string;
}

export interface MessageCreatedPayload {
	messageId: string;
	locationId: string;
	characterId: string | null;
	content: string;
	createdAt: string;
}

export interface MessageEditedPayload {
	messageId: string;
	content: string;
	gmAnnotation: string | null;
	editedAt: string;
}

export interface CharacterMovedPayload {
	characterId: string;
	fromLocationId: string | null;
	toLocationId: string;
}

export interface CharacterStatPayload {
	characterId: string;
	field: 'hp' | 'mp' | 'maxHp' | 'maxMp';
	oldValue: number;
	newValue: number;
}

export interface CharacterItemPayload {
	characterId: string;
	charItem: {
		id: string;
		itemTypeId: string;
		quantity: number | null;
		durability: number | null;
	} | null;
}

export interface DiceRollPayload {
	characterId: string;
	expression: string;
	dice: number[];
	modifier: number;
	total: number;
}
