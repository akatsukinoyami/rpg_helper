import { BASE_STATS } from '../stats';

// Game 3 – Post-apocalyptic, GM: Дмитрий
export const GAME3 = {
	name: 'Пустошь',
	description: 'Мир после катастрофы. Выживание — единственный закон.',
	statDefs: [
		{ key: 'hp', label: 'Живучесть', isVital: true, color: '#ef4444', sortOrder: 1 },
		{ key: 'mp', label: 'Концентрация', isVital: true, color: '#f6f03b', sortOrder: 2 },
		...BASE_STATS
	],
	skillTypes: [
		{ name: 'Стрельба', description: 'Владение огнестрельным и метательным оружием' },
		{ name: 'Взлом', description: 'Открытие замков и электронных замков' },
		{ name: 'Медицина пустоши', description: 'Лечение ран подручными средствами' },
		{ name: 'Торговля хламом', description: 'Обмен мусором по выгодному курсу' }
	],
	itemTypes: [
		{
			name: 'Самодельный пистолет',
			description: 'Ненадёжный, но смертоносный',
			trackingMode: 'durability' as const,
			maxDurability: 50,
			weight: '0.9'
		},
		{
			name: 'Консервы',
			description: 'Единственная еда в пустоши',
			trackingMode: 'quantity' as const,
			weight: '0.4'
		},
		{
			name: 'Аптечка',
			description: 'Остатки довоенной медицины',
			trackingMode: 'quantity' as const,
			weight: '0.6'
		},
		{
			name: 'Металлолом',
			description: 'Валюта пустоши',
			trackingMode: 'quantity' as const,
			weight: '0.1'
		}
	],
	locations: [
		{ name: 'Пустошь', description: 'Корень мира', parentId: null },
		{ name: 'Руины Старого Города', description: 'Обломки некогда великого мегаполиса', parent: 0 }
	],
	chars: [
		{
			userId: 'user-dmitriy',
			name: 'Рустам Отшельник',
			gender: 'male' as const,
			age: 45,
			prehistory: 'Бывший военный инженер, выживший в бункере двадцать лет.',
			vitals: { hp: { current: 45, max: 45 }, mp: { current: 25, max: 25 } },
			stats: { str: 11, dex: 10, con: 14, int: 15, wis: 13, cha: 7 }
		},
		{
			userId: 'user-aleksey',
			name: 'Надя Странница',
			gender: 'female' as const,
			age: 19,
			prehistory: 'Выросла среди руин, научилась выживать раньше, чем ходить.',
			vitals: { hp: { current: 32, max: 32 }, mp: { current: 18, max: 18 } },
			stats: { str: 9, dex: 15, con: 10, int: 10, wis: 12, cha: 10 }
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
