import { BASE_STATS } from '../stats';

// Game 1 – Nordic fantasy, GM: Алексей
export const GAME1 = {
	name: 'Хроники Арктики',
	description: 'Суровый север, где боги ещё не покинули смертных.',
	statDefs: [
		{ key: 'hp', label: 'Здоровье', isVital: true, color: '#ef4444', sortOrder: 1 },
		{ key: 'mp', label: 'Мана', isVital: true, color: '#3b82f6', sortOrder: 2 },
		...BASE_STATS
	],
	skillTypes: [
		{ name: 'Владение мечом', description: 'Атаки холодным оружием ближнего боя' },
		{ name: 'Магия льда', description: 'Управление холодом и зимними стихиями' },
		{ name: 'Выживание в тундре', description: 'Ориентирование и добыча пищи на севере' },
		{ name: 'Охота', description: 'Отслеживание и добыча дичи' }
	],
	itemTypes: [
		{
			name: 'Меч викинга',
			description: 'Широкий железный меч',
			trackingMode: 'durability' as const,
			maxDurability: 100,
			weight: '3.5'
		},
		{
			name: 'Меховой плащ',
			description: 'Тёплый плащ из медвежьей шкуры',
			trackingMode: 'durability' as const,
			maxDurability: 60,
			weight: '2.0'
		},
		{
			name: 'Золотые монеты',
			description: 'Местная валюта',
			trackingMode: 'quantity' as const,
			weight: '0.01'
		},
		{
			name: 'Целебное зелье',
			description: 'Восстанавливает здоровье',
			trackingMode: 'quantity' as const,
			weight: '0.3'
		}
	],
	locations: [
		{ name: 'Хроники Арктики', description: 'Корень мира', parentId: null },
		{ name: 'Деревня Фьорда', description: 'Небольшое поселение у замёрзшего залива', parent: 0 }
	],
	chars: [
		{
			userId: 'user-aleksey',
			name: 'Эрик Снежный',
			gender: 'male' as const,
			age: 28,
			prehistory: 'Северный воин, потерявший свой клан в битве с морозными великанами.',
			vitals: { hp: { current: 42, max: 42 }, mp: { current: 10, max: 10 } },
			stats: { str: 14, dex: 10, con: 13, int: 9, wis: 10, cha: 8 }
		},
		{
			userId: 'user-mariya',
			name: 'Фрея Ледяная',
			gender: 'female' as const,
			age: 24,
			prehistory: 'Молодая жрица богини зимы, ищущая артефакт своего ордена.',
			vitals: { hp: { current: 28, max: 28 }, mp: { current: 35, max: 35 } },
			stats: { str: 7, dex: 12, con: 9, int: 14, wis: 13, cha: 11 }
		}
	],
	races: [
		{
			name: 'Человек',
			description: 'Разносторонние и амбициозные, люди — самая распространённая раса.',
			baseStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
			startingSkills: ['Persuasion']
		},
		{
			name: 'Эльф',
			description:
				'Изящные и долгоживущие, эльфы обладают природным сродством с магией и дикой природой.',
			baseStats: { str: 8, dex: 14, con: 8, int: 12, wis: 12, cha: 10 },
			startingSkills: ['Perception', 'Arcana']
		},
		{
			name: 'Дварф',
			description: 'Крепкие и стойкие, дварфы — прославленные мастера и свирепые воины.',
			baseStats: { str: 13, dex: 8, con: 15, int: 10, wis: 11, cha: 8 },
			startingSkills: ['Athletics', 'Medicine']
		},
		{
			name: 'Полурослик',
			description:
				'Маленькие и проворные, полурослики — удачливые странники с умением избегать неприятностей.',
			baseStats: { str: 7, dex: 14, con: 10, int: 10, wis: 10, cha: 12 },
			startingSkills: ['Stealth', 'Acrobatics']
		},
		{
			name: 'Орк',
			description: 'Могучие и свирепые, орки — прирождённые воины, закалённые жестокой средой.',
			baseStats: { str: 16, dex: 9, con: 14, int: 7, wis: 8, cha: 7 },
			startingSkills: ['Intimidation', 'Athletics']
		},
		{
			name: 'Неко',
			description:
				'Кошколюди с кошачьей грацией, острыми инстинктами и неотразимым обаянием. Любопытные и непредсказуемые.',
			baseStats: { str: 7, dex: 15, con: 8, int: 10, wis: 11, cha: 13 },
			startingSkills: ['Stealth', 'Acrobatics']
		},
		{
			name: 'Инуко',
			description:
				'Собаколюди, известные преданностью, неиссякаемой энергией и острыми чувствами. Прирождённые вожаки стаи.',
			baseStats: { str: 12, dex: 12, con: 11, int: 9, wis: 13, cha: 11 },
			startingSkills: ['Perception', 'Athletics']
		},
		{
			name: 'Гарпия',
			description:
				'Крылатые птицелюди с острым зрением и стремительными движениями. Гордые и свободолюбивые.',
			baseStats: { str: 8, dex: 15, con: 8, int: 10, wis: 14, cha: 10 },
			startingSkills: ['Perception', 'Acrobatics']
		},
		{
			name: 'Ламия',
			description:
				'Змеелюди с мощным телом и завораживающим взглядом. Древние, терпеливые и гипнотически убедительные.',
			baseStats: { str: 13, dex: 11, con: 13, int: 10, wis: 9, cha: 14 },
			startingSkills: ['Intimidation', 'Persuasion']
		},
		{
			name: 'Дракониды',
			description:
				'Воины с драконьей кровью: чешуя, когти и врождённое владение древней магией. Гордые и могущественные.',
			baseStats: { str: 14, dex: 8, con: 13, int: 12, wis: 9, cha: 10 },
			startingSkills: ['Intimidation', 'Arcana']
		},
		{
			name: 'Ангел',
			description:
				'Небесные существа лучистого света и божественной мудрости. Сострадательные и справедливые.',
			baseStats: { str: 10, dex: 11, con: 10, int: 13, wis: 15, cha: 13 },
			startingSkills: ['Medicine', 'Persuasion']
		},
		{
			name: 'Демон',
			description:
				'Инфернальные существа грубой силы и хитрых амбиций. Мастера страха и желания, процветающие в хаосе.',
			baseStats: { str: 14, dex: 11, con: 12, int: 13, wis: 7, cha: 12 },
			startingSkills: ['Intimidation', 'Arcana']
		},
		{
			name: 'Суккуб / Инкуб',
			description:
				'Демоны желания с неотразимым обаянием и серебряным языком. Хрупкие телом, но опустошительно эффективные через очарование.',
			baseStats: { str: 7, dex: 13, con: 8, int: 12, wis: 8, cha: 17 },
			startingSkills: ['Persuasion', 'Intimidation']
		}
	]
};
