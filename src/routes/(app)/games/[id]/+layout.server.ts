import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ params }) => ({ gameId: params.id });
