import React from "react";
import { UserWithReservations } from '../auth.server';

export const RootContext = React.createContext({
	darkmode: false,
	toggleDarkMode: () => {},
});

export const UserContext = React.createContext({
	user: undefined as UserWithReservations | undefined,
});