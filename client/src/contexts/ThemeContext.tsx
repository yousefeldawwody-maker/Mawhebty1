import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
type Theme = "light" | "dark";
const Ctx = createContext<{theme:Theme;toggleTheme:()=>void}>({theme:"light",toggleTheme:()=>{}});
export function ThemeProvider({children,defaultTheme="light"}:{children:ReactNode;defaultTheme?:Theme;switchable?:boolean}) { const [theme,setTheme]=useState<Theme>(()=>(localStorage.getItem("mawhebty-theme") as Theme)||defaultTheme); useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("mawhebty-theme",theme)},[theme]); return <Ctx.Provider value={{theme,toggleTheme:()=>setTheme(t=>t==="light"?"dark":"light")}}>{children}</Ctx.Provider> }
export const useTheme=()=>useContext(Ctx);
