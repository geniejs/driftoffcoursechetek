import React from "react";
import type { User } from '@prisma/client';

export const RootContext = React.createContext({
	darkmode: false,
	toggleDarkMode: () => {},
});

export const UserContext = React.createContext({
	user: undefined as User | undefined,
});