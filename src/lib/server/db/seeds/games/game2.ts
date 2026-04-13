import { BASE_STATS } from '../stats';

// Game 2 – Dark naval fantasy, GM: Мария
export const GAME2 = {
	name: 'Тёмные воды',
	description: 'Пиратские моря, где каждый порт таит опасность.',
	statDefs: [
		{ key: 'hp', label: 'Стойкость', isVital: true, color: '#2cea38', sortOrder: 1 },
		{ key: 'mp', label: 'Воля', isVital: true, color: '#3b82f6', sortOrder: 2 },
		...BASE_STATS
	],
	skillTypes: [
		{ name: 'Мореплавание', description: 'Управление кораблём и навигация' },
		{ name: 'Фехтование', description: 'Искусство владения клинком' },
		{ name: 'Контрабанда', description: 'Тайная перевозка запрещённых товаров' },
		{ name: 'Запугивание', description: 'Принудить к подчинению угрозами' }
	],
	itemTypes: [
		{
			name: 'Абордажная сабля',
			description: 'Кривой клинок морского разбойника',
			trackingMode: 'durability' as const,
			maxDurability: 80,
			weight: '1.8'
		},
		{
			name: 'Ром',
			description: 'Крепкий напиток из тростника',
			trackingMode: 'quantity' as const,
			weight: '0.5'
		},
		{
			name: 'Золото',
			description: 'Универсальная валюта портов',
			trackingMode: 'quantity' as const,
			weight: '0.01'
		},
		{
			name: 'Морской компас',
			description: 'Точный инструмент навигатора',
			trackingMode: 'durability' as const,
			maxDurability: 200,
			weight: '0.2'
		}
	],
	locations: [
		{ name: 'Тёмные воды', description: 'Корень мира', parentId: null },
		{ name: 'Порт Костяной якорь', description: 'Мрачный портовый город пиратов', parent: 0 }
	],
	chars: [
		{
			userId: 'user-mariya',
			name: 'Капитан Морган',
			gender: 'none' as const,
			age: 35,
			prehistory: 'Легендарный пират, захвативший семь торговых флотилий.',
			vitals: { hp: { current: 38, max: 38 }, mp: { current: 15, max: 15 } },
			stats: { str: 12, dex: 13, con: 11, int: 12, wis: 9, cha: 14 }
		},
		{
			userId: 'user-dmitriy',
			name: 'Чёрная Роза',
			gender: 'female' as const,
			age: 22,
			prehistory: 'Беглянка из знатного дома, нашедшая свободу на море.',
			vitals: { hp: { current: 30, max: 30 }, mp: { current: 20, max: 20 } },
			stats: { str: 9, dex: 16, con: 9, int: 11, wis: 11, cha: 13 }
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
