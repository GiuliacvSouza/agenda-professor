import { useState } from "react";
import { LoginRegister } from "./components/auth/LoginRegister";

export function storeToken(token: string) {
    localStorage.setItem("token", token);
} 