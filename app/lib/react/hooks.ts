import type { EffectCallback } from 'react';
import { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (fun: EffectCallback) => useEffect(fun, []);
export declare type UpdatePhoneHook<M> = [
	M,
	string,
	React.Dispatch<React.SetStateAction<string | undefined>>,
	boolean,
	Error | undefined
];

export type UpdatePhoneNumberHook = UpdatePhoneHook<
	(phone: string, applicationVerifier: any) => Promise<void>
>;
