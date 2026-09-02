import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Titulo from "../icons_Components/Icon_Logo_Comp";
import Sair from "../icons_Components/Icon_Sair_Comp";
import styles from "./AppShell.module.css";

const ID_CONTEUDO = "conteudo-principal";
const ID_NAVEGACAO = "navegacao-principal";
const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function AppShell({ navItems, titulo, children }) {
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [recolhida, setRecolhida] = useState(false);
  const sidebarRef = useRef(null);
  const botaoAbrirRef = useRef(null);
  const botaoFecharRef = useRef(null);
  const bodyRef = useRef(null);
  const { logout } = useAuth();
  const { escuro, alternarTema } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!gavetaAberta) return undefined;

    const body = bodyRef.current;
    const botaoAbrir = botaoAbrirRef.current;

    body.inert = true;
    const temporizadorFoco = setTimeout(() => botaoFecharRef.current?.focus(), 0);

    function controlarTeclado(evento) {
      if (evento.key === "Escape") {
        setGavetaAberta(false);
        return;
      }

      if (evento.key !== "Tab") return;

      const focaveis = Array.from(
        sidebarRef.current?.querySelectorAll(SELETOR_FOCAVEL) ?? []
      ).filter((elemento) => elemento.getClientRects().length > 0);
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo?.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro?.focus();
      }
    }

    document.addEventListener("keydown", controlarTeclado);
    return () => {
      clearTimeout(temporizadorFoco);
      document.removeEventListener("keydown", controlarTeclado);
      body.inert = false;
      botaoAbrir?.focus();
    };
  }, [gavetaAberta]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const classesSidebar = [
    styles.sidebar,
    recolhida ? styles.sidebarCollapsed : "",
    gavetaAberta ? styles.sidebarOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.shell}>
      <a className="skip-link" href={`#${ID_CONTEUDO}`}>
        Pular para o conteúdo principal
      </a>

      {gavetaAberta && (
        <button
          type="button"
          className={styles.overlay}
          onClick={() => setGavetaAberta(false)}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      <div
        ref={sidebarRef}
        className={classesSidebar}
        id={ID_NAVEGACAO}
        role={gavetaAberta ? "dialog" : undefined}
        aria-modal={gavetaAberta || undefined}
        aria-label={gavetaAberta ? "Menu de navegação" : undefined}
      >
        <div className={styles.sidebarHeader}>
          <button
            type="button"
            className={[styles.iconButton, styles.collapseButton].join(" ")}
            onClick={() => setRecolhida((valor) => !valor)}
            aria-expanded={!recolhida}
            aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
          >
            {recolhida ? (
              <PanelLeftOpen size={24} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={24} aria-hidden="true" />
            )}
          </button>

          {!recolhida && <Titulo className={styles.logo} />}

          <button
            ref={botaoFecharRef}
            type="button"
            className={[styles.iconButton, styles.menuButton].join(" ")}
            onClick={() => setGavetaAberta(false)}
            aria-label="Fechar menu de navegação"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icone = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setGavetaAberta(false)}
                className={({ isActive }) =>
                  [styles.navItem, isActive ? styles.navItemActive : ""]
                    .filter(Boolean)
                    .join(" ")
                }
                title={recolhida ? item.label : undefined}
              >
                <Icone className={styles.navIcon} size={24} aria-hidden="true" />
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button type="button" className={styles.logout} onClick={handleLogout}>
          <Sair size={24} aria-hidden="true" />
          <span className={styles.navLabel}>Sair</span>
        </button>
      </div>

      <div
        ref={bodyRef}
        className={[styles.body, recolhida ? styles.bodyCollapsed : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <header className={styles.header}>
          <button
            ref={botaoAbrirRef}
            type="button"
            className={[styles.headerButton, styles.menuButton].join(" ")}
            onClick={() => setGavetaAberta(true)}
            aria-expanded={gavetaAberta}
            aria-controls={ID_NAVEGACAO}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          {titulo && <span className={styles.headerTitle}>{titulo}</span>}

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerButton}
              onClick={alternarTema}
              aria-pressed={escuro}
              aria-label={
                escuro ? "Usar tema claro" : "Usar tema escuro"
              }
            >
              {escuro ? (
                <Sun size={20} aria-hidden="true" />
              ) : (
                <Moon size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        <main className={styles.main} id={ID_CONTEUDO} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
