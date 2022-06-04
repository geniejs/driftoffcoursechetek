import { FormProps, useSubmitImpl } from '@remix-run/react/components';
import { Fetcher } from '@remix-run/react/transition';
export declare function createFetcherForm(
	fetchKey: string
): React.ForwardRefExoticComponent<
	FormProps & React.RefAttributes<HTMLFormElement>
>;

export declare type FetcherWithComponents<TData> = Fetcher<TData> & {
	Form: ReturnType<typeof createFetcherForm>;
	submit: ReturnType<typeof useSubmitImpl>;
	load: (href: string) => void;
};


