"use client"

import { userService } from "@/services/api.service";
import { AuthContextProps, UserProps } from "@/types";
import { createContext, useState } from "react";


export const AuthContext = createContext({} as AuthContextProps);

export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProps>();

  const fetchUser = async (wallet: string) => {
    const res = await userService.fetch(wallet);
    setUser(res);
    return res;
  }

  const updateUser = async (payload: UserProps) => {
    const res = await userService.update(payload);
    setUser(res);
  }

  const createUser = async (wallet: string) => {
    const res = await userService.create(wallet);
    setUser(res);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        fetchUser,
        updateUser,
        createUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default ContextProvider;