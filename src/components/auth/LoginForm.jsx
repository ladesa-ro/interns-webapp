import { useState } from "react";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Button, Card, Input } from "../ui";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./LoginForm.module.css";
import Titulo from "../icons_Components/Icon_Logo_Comp";

const ERRO_CAMPOS_OBRIGATORIOS = "Informe matrícula e senha.";
const ID_ERRO_LOGIN = "erro-login";

export default function LoginForm({ form, onChange, onSubmit, erro, enviando }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { escuro, alternarTema } = useTheme();
  const erroNosCampos = erro === ERRO_CAMPOS_OBRIGATORIOS ? erro : undefined;
  const erroGlobal = erro && !erroNosCampos ? erro : "";
  const descricaoErroGlobal = erroGlobal
    ? { "aria-describedby": ID_ERRO_LOGIN, "aria-invalid": true }
    : {};

  return (
    <main className={styles.page}>
      <div className={styles.brandShapeStart} aria-hidden="true" />
      <div className={styles.brandShapeEnd} aria-hidden="true" />

      <button
        type="button"
        className={styles.themeButton}
        onClick={alternarTema}
        aria-label={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
        aria-pressed={escuro}
      >
        {escuro ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </button>

      <Card padding="none" elevated className={styles.card}>
        <form
          onSubmit={onSubmit}
          className={styles.form}
          aria-labelledby="titulo-login"
          noValidate
        >
          <h1 id="titulo-login" className="sr-only">
            Acessar o sistema de estágios
          </h1>
          <Titulo className={styles.logo} />

          <Input
            id="matricula"
            name="matricula"
            type="text"
            label="Matrícula"
            autoComplete="username"
            value={form.matricula}
            onChange={onChange}
            error={erroNosCampos}
            className={erroGlobal ? styles.invalidGlobal : ""}
            {...descricaoErroGlobal}
            disabled={enviando}
          />

          <div className={styles.passwordField}>
            <Input
              id="senha"
              name="senha"
              type={mostrarSenha ? "text" : "password"}
              label="Senha"
              autoComplete="current-password"
              value={form.senha}
              onChange={onChange}
              error={erroNosCampos}
              {...descricaoErroGlobal}
              className={[styles.passwordInput, erroGlobal ? styles.invalidGlobal : ""]
                .filter(Boolean)
                .join(" ")}
              disabled={enviando}
            />
            <button
              type="button"
              className={styles.passwordButton}
              onClick={() => setMostrarSenha((valor) => !valor)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={mostrarSenha}
              disabled={enviando}
            >
              {mostrarSenha ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </button>
          </div>

          <p className={styles.forgotPassword}>
            Esqueceu a senha? <a href="/">Clique aqui.</a>
          </p>

          {erroGlobal && (
            <p id={ID_ERRO_LOGIN} className={styles.error} role="alert">
              {erroGlobal}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={enviando}
            disabled={enviando}
            loadingLabel="Entrando"
          >
            {enviando ? null : "Entrar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
