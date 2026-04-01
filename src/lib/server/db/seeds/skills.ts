export const skillsSeed = [
	{
		name: { en: 'Stealth', ru: 'Скрытность', ua: 'Непомітність' },
		description: {
			en: 'Move silently and avoid detection',
			ru: 'Двигаться бесшумно и избегать обнаружения',
			ua: 'Рухатися безшумно та уникати виявлення'
		}
	},
	{
		name: { en: 'Persuasion', ru: 'Убеждение', ua: 'Переконання' },
		description: {
			en: 'Convince others through charm and diplomacy',
			ru: 'Убеждать других через обаяние и дипломатию',
			ua: 'Переконувати інших через чарівність та дипломатію'
		},
		statModifiers: { cha: 1 }
	},
	{
		name: { en: 'Intimidation', ru: 'Запугивание', ua: 'Залякування' },
		description: {
			en: 'Frighten others into compliance',
			ru: 'Принудить других к подчинению страхом',
			ua: 'Змусити інших підкоритися страхом'
		},
		statModifiers: { str: 1 }
	},
	{
		name: { en: 'Arcana', ru: 'Арканы', ua: 'Аркани' },
		description: {
			en: 'Knowledge of spells, magic items, and planes',
			ru: 'Знание заклинаний, магических предметов и планов',
			ua: 'Знання заклинань, магічних предметів та планів'
		},
		statModifiers: { int: 1 }
	},
	{
		name: { en: 'Athletics', ru: 'Атлетика', ua: 'Атлетика' },
		description: {
			en: 'Climbing, jumping, and swimming',
			ru: 'Лазание, прыжки и плавание',
			ua: 'Лазіння, стрибки та плавання'
		},
		statModifiers: { str: 1 }
	},
	{
		name: { en: 'Perception', ru: 'Восприятие', ua: 'Сприйняття' },
		description: {
			en: 'Spot, hear, and detect things around you',
			ru: 'Замечать, слышать и обнаруживать окружающее',
			ua: 'Помічати, чути та виявляти навколишнє'
		},
		statModifiers: { wis: 1 }
	},
	{
		name: { en: 'Survival', ru: 'Выживание', ua: 'Виживання' },
		description: {
			en: 'Follow tracks, forage, navigate wilderness',
			ru: 'Следить за следами, добывать еду, ориентироваться в дикой природе',
			ua: 'Стежити за слідами, добувати їжу, орієнтуватися в дикій природі'
		},
		statModifiers: { wis: 1 }
	},
	{
		name: { en: 'Medicine', ru: 'Медицина', ua: 'Медицина' },
		description: {
			en: 'Stabilise the dying and diagnose illness',
			ru: 'Стабилизировать умирающих и диагностировать болезни',
			ua: 'Стабілізувати вмираючих та діагностувати хвороби'
		},
		statModifiers: { wis: 1 }
	},
	{
		name: { en: 'Acrobatics', ru: 'Акробатика', ua: 'Акробатика' },
		description: {
			en: 'Balance, tumble, and perform aerial manoeuvres',
			ru: 'Балансировать, кувыркаться и выполнять воздушные манёвры',
			ua: 'Балансувати, перекидатися та виконувати повітряні маневри'
		},
		statModifiers: { dex: 1 }
	},
	{
		name: { en: 'Lockpicking', ru: 'Взлом замков', ua: 'Злам замків' },
		description: {
			en: 'Open locks without the key',
			ru: 'Открывать замки без ключа',
			ua: 'Відкривати замки без ключа'
		},
		statModifiers: { dex: 1 }
	}
];