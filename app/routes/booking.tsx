import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import Account, {
	action as accountAction,
	loader as accountLoader,
} from './account';

export let action: ActionFunction = accountAction;

export let loader: LoaderFunction = accountLoader;
export default Account;
