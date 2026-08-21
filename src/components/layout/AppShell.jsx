import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Titulo from "../icons_Components/Icon_Logo_Comp";
import Sair from "../icons_Components/Icon_Sair_Comp";
import styles from "./AppShell.module.css";

const ID_CONTEUDO = "conteudo-principal";
const ID_NAVEGACAO = "navegacao-principal";

export default function AppShell({ navItems, titulo, children }) {
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [recolhida, setRecolhida] = useState(false);
  const { logout } = useAuth();
  const { escuro, alternarTema } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!gavetaAberta) return undefined;

    function fecharComEsc(evento) {
      if (evento.key === "Escape") setGavetaAberta(false);
    }

    document.addEventListener("keydown", fecharComEsc);
    return () => document.removeEventListener("keydown", fecharComEsc);
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
          aria-label="Fechar menu de navegação"
        />
      )}

      <div className={classesSidebar} id={ID_NAVEGACAO}>
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
        className={[styles.body, recolhida ? styles.bodyCollapsed : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <header className={styles.header}>
          <button
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
