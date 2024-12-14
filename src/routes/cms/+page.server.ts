import { getCms } from '@externaladdress4401/beatstar-protobuf-parser/server/CMSRequester';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const cms = await getCms();
	return { cms };
};
