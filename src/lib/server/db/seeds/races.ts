export const racesSeed = [
	{
		name: { en: 'Human', ru: 'Человек', ua: 'Людина' },
		description: {
			en: 'Versatile and ambitious, humans are the most widespread race.',
			ru: 'Разносторонние и амбициозные, люди — самая распространённая раса.',
			ua: 'Різносторонні та амбітні, люди — найпоширеніша раса.'
		},
		baseStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
		startingSkills: ['Persuasion']
	},
	{
		name: { en: 'Elf', ru: 'Эльф', ua: 'Ельф' },
		description: {
			en: 'Graceful and long-lived, elves have a natural affinity for magic and the wilds.',
			ru: 'Изящные и долгоживущие, эльфы обладают природным сродством с магией и дикой природой.',
			ua: 'Витончені та довгоживучі, ельфи мають природну спорідненість з магією та дикою природою.'
		},
		baseStats: { str: 8, dex: 14, con: 8, int: 12, wis: 12, cha: 10 },
		startingSkills: ['Perception', 'Arcana']
	},
	{
		name: { en: 'Dwarf', ru: 'Дварф', ua: 'Дварф' },
		description: {
			en: 'Stout and resilient, dwarves are renowned craftsmen and fierce warriors.',
			ru: 'Крепкие и стойкие, дварфы — прославленные мастера и свирепые воины.',
			ua: 'Кремезні та стійкі, дварфи — уславлені майстри та лютими воїни.'
		},
		baseStats: { str: 13, dex: 8, con: 15, int: 10, wis: 11, cha: 8 },
		startingSkills: ['Athletics', 'Medicine']
	},
	{
		name: { en: 'Halfling', ru: 'Полурослик', ua: 'Напівзростань' },
		description: {
			en: 'Small and nimble, halflings are lucky wanderers with a knack for staying out of trouble.',
			ru: 'Маленькие и проворные, полурослики — удачливые странники с умением избегать неприятностей.',
			ua: 'Маленькі та спритні, напівзростані — вдачливі мандрівники з умінням уникати неприємностей.'
		},
		baseStats: { str: 7, dex: 14, con: 10, int: 10, wis: 10, cha: 12 },
		startingSkills: ['Stealth', 'Acrobatics']
	},
	{
		name: { en: 'Orc', ru: 'Орк', ua: 'Орк' },
		description: {
			en: 'Powerful and fierce, orcs are natural warriors hardened by brutal environments.',
			ru: 'Могучие и свирепые, орки — прирождённые воины, закалённые жестокой средой.',
			ua: 'Могутні та лютi, орки — природжені воїни, загартовані жорстоким середовищем.'
		},
		baseStats: { str: 16, dex: 9, con: 14, int: 7, wis: 8, cha: 7 },
		startingSkills: ['Intimidation', 'Athletics']
	},
	{
		name: { en: 'Neko', ru: 'Неко', ua: 'Неко' },
		description: {
			en: 'Cat-folk with feline grace, sharp instincts, and an irresistible charm. Curious and unpredictable.',
			ru: 'Кошколюди с кошачьей грацией, острыми инстинктами и неотразимым обаянием. Любопытные и непредсказуемые.',
			ua: 'Котолюди з котячою грацією, гострими інстинктами та нездоланним шармом. Допитливі та непередбачувані.'
		},
		baseStats: { str: 7, dex: 15, con: 8, int: 10, wis: 11, cha: 13 },
		startingSkills: ['Stealth', 'Acrobatics']
	},
	{
		name: { en: 'Inuko', ru: 'Инуко', ua: 'Інуко' },
		description: {
			en: 'Dog-folk known for fierce loyalty, boundless energy, and keen senses. Natural pack leaders and tireless companions.',
			ru: 'Собаколюди, известные преданностью, неиссякаемой энергией и острыми чувствами. Прирождённые вожаки стаи.',
			ua: 'Собаколюди, відомі відданістю, невичерпною енергією та гострими відчуттями. Природжені ватажки зграї.'
		},
		baseStats: { str: 12, dex: 12, con: 11, int: 9, wis: 13, cha: 11 },
		startingSkills: ['Perception', 'Athletics']
	},
	{
		name: { en: 'Harpy', ru: 'Гарпия', ua: 'Гарпія' },
		description: {
			en: 'Winged bird-folk with razor-sharp eyes and swift movement. Proud and free-spirited, deeply uncomfortable on the ground.',
			ru: 'Крылатые птицелюди с острым зрением и стремительными движениями. Гордые и свободолюбивые, чувствующие себя неуютно на земле.',
			ua: 'Крилаті птахолюди з гострим зором та стрімкими рухами. Горді та волелюбні, незручно почуваються на землі.'
		},
		baseStats: { str: 8, dex: 15, con: 8, int: 10, wis: 14, cha: 10 },
		startingSkills: ['Perception', 'Acrobatics']
	},
	{
		name: { en: 'Lamia', ru: 'Ламия', ua: 'Ламія' },
		description: {
			en: 'Serpent-folk with a powerful coiled body and an enchanting gaze. Ancient, patient, and hypnotically persuasive.',
			ru: 'Змеелюди с мощным телом и завораживающим взглядом. Древние, терпеливые и гипнотически убедительные.',
			ua: 'Зміюлюди з потужним тілом та зачаровуючим поглядом. Стародавні, терплячі та гіпнотично переконливі.'
		},
		baseStats: { str: 13, dex: 11, con: 13, int: 10, wis: 9, cha: 14 },
		startingSkills: ['Intimidation', 'Persuasion']
	},
	{
		name: { en: 'Draconid', ru: 'Дракониды', ua: 'Драконід' },
		description: {
			en: 'Dragon-blooded warriors with scales, claws, and an innate mastery of ancient magic. Proud, powerful, and long-memoried.',
			ru: 'Воины с драконьей кровью: чешуя, когти и врождённое владение древней магией. Гордые, могущественные, с долгой памятью.',
			ua: "Воїни з драконячою кров'ю: луска, кігті та вроджене володіння стародавньою магією. Горді, могутні, з довгою пам'яттю."
		},
		baseStats: { str: 14, dex: 8, con: 13, int: 12, wis: 9, cha: 10 },
		startingSkills: ['Intimidation', 'Arcana']
	},
	{
		name: { en: 'Angel', ru: 'Ангел', ua: 'Ангел' },
		description: {
			en: 'Celestial beings of radiant light and divine wisdom. Compassionate and just, though their mercy can be ruthless.',
			ru: 'Небесные существа лучистого света и божественной мудрости. Сострадательные и справедливые, хотя их милосердие бывает беспощадным.',
			ua: 'Небесні істоти променистого світла та божественної мудрості. Співчутливі та справедливі, хоча їхня милість буває нещадною.'
		},
		baseStats: { str: 10, dex: 11, con: 10, int: 13, wis: 15, cha: 13 },
		startingSkills: ['Medicine', 'Persuasion']
	},
	{
		name: { en: 'Demon', ru: 'Демон', ua: 'Демон' },
		description: {
			en: 'Infernal beings of raw power and cunning ambition. Masters of fear and desire, they thrive in chaos.',
			ru: 'Инфернальные существа грубой силы и хитрых амбиций. Мастера страха и желания, процветающие в хаосе.',
			ua: 'Інфернальні істоти грубої сили та підступних амбіцій. Майстри страху та бажання, що процвітають у хаосі.'
		},
		baseStats: { str: 14, dex: 11, con: 12, int: 13, wis: 7, cha: 12 },
		startingSkills: ['Intimidation', 'Arcana']
	},
	{
		name: { en: 'Succubus / Incubus', ru: 'Суккуб / Инкуб', ua: 'Суккуб / Інкуб' },
		description: {
			en: 'Desire demons of irresistible allure and silver tongue. Fragile in body but devastatingly effective through charm and manipulation.',
			ru: 'Демоны желания с неотразимым обаянием и серебряным языком. Хрупкие телом, но опустошительно эффективные через очарование и манипуляции.',
			ua: 'Демони бажання з нездоланною чарівністю та срібним язиком. Тендітні тілом, але нищівно ефективні через чарівність та маніпуляції.'
		},
		baseStats: { str: 7, dex: 13, con: 8, int: 12, wis: 8, cha: 17 },
		startingSkills: ['Persuasion', 'Intimidation']
	}
];