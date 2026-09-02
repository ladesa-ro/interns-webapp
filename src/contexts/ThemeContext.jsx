import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "ladesa-tema";
const TEMA_CLARO = "light";
const TEMA_ESCURO = "dark";

function temaInicial() {
  if (typeof window === "undefined") return TEMA_CLARO;

  const salvo = window.localStorage.getItem(STORAGE_KEY);
  if (salvo === TEMA_CLARO || salvo === TEMA_ESCURO) return salvo;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? TEMA_ESCURO
    : TEMA_CLARO;
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    document.documentElement.style.colorScheme = tema;
    window.localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((atual) => (atual === TEMA_ESCURO ? TEMA_CLARO : TEMA_ESCURO));
  }, []);

  const valor = useMemo(
    () => ({ tema, alternarTema, escuro: tema === TEMA_ESCURO }),
    [tema, alternarTema]
  );

  return (
    <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const contexto = useContext(ThemeContext);

  if (!contexto) {
    throw new Error("useTheme precisa estar dentro de ThemeProvider.");
  }

  return contexto;
}
