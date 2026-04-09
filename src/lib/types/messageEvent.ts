export type SystemEventType = 'move' | 'characterChange' | 'itemChange' | 'skillChange' | 'diceRoll';
export type ProposalEventType = 'characterChange' | 'itemChange' | 'skillChange';

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface MoveEvent {
	type: 'move';
	id: string;
	fromLocationId: string;
	toLocationId: string;
	fromLocationName?: string;
	toLocationName?: string;
}

export interface CharacterChangeEvent {
	type: 'characterChange';
	id: string;
	stat: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | 'hp' | 'mp' | 'maxHp' | 'maxMp';
	delta: number;
	reason: string | null;
	status: ProposalStatus;
}

export interface ItemChangeEvent {
	type: 'itemChange';
	id: string;
	charItemId: string | null;
	itemTypeId: string;
	itemTypeName?: string;
	deltaQty: number | null;
	deltaDur: number | null;
	reason: string | null;
	status: ProposalStatus;
}

export interface SkillChangeEvent {
	type: 'skillChange';
	id: string;
	skillTypeId: string;
	skillTypeName?: string;
	action: 'add' | 'remove';
	reason: string | null;
	status: ProposalStatus;
}

// Dice expression types — used for form validation and display
export type DiceSchema = `${number}d${number}`;
export type Modifier = `${'+' | '-'}${number}`;
export type DiceExpression = DiceSchema | `${DiceSchema}${Modifier}`;

export interface DiceRollEvent {
	type: 'diceRoll';
	id: string;
	expression: string;
	rolls: number[];
	modifier: number;
	result: number;
}

export type ProposalEvent =
	| CharacterChangeEvent
	| ItemChangeEvent
	| SkillChangeEvent;

export type SystemEvent =
	| MoveEvent
	| ProposalEvent
	| DiceRollEvent;
