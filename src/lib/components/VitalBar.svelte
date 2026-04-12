<script lang="ts">
	interface Props {
		current: number;
		max: number;
		color: string;
	}

	let { current, max, color }: Props = $props();

	const pct = $derived(Math.max(0, Math.min(100, Math.round((current / max) * 100))));
</script>

<div class="relative w-full h-3 rounded-full overflow-hidden saturate-80 bg-gray-700">
	<div
		class="absolute inset-y-0 left-0 rounded-lg"
		style:width="{pct}%"
		style:background-color={color}
	></div>
	<span class="absolute inset-0 flex items-center justify-center text-[10px] font-medium drop-shadow-sm leading-none text-white">
		{current}/{max}
	</span>
</div>
