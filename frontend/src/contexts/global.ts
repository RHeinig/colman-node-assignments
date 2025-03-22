import { createContext } from "react";

export interface User {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
}

interface GlobalContextType {
    user?: User;
    setUser: (user?: User) => void;
}

const GlobalContext = createContext<GlobalContextType>({
    setUser: () => { },
});

export default GlobalContext;