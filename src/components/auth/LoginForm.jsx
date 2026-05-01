import React from "react";
import styles from "./LoginForm.module.css";
import Titulo from "../icons_Components/Icon_Logo_Comp";
import Imagem from "../image_Components/Image_Login_Comp";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm({ form, onChange, onSubmit }) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.card}>
          <form onSubmit={onSubmit} className={styles.form}>
            <Titulo className={styles.logo} />
            <div className={styles.inputUser}>
            <input
              type="text"
              name="matricula"
              placeholder=""
              value={form.matricula}
              onChange={onChange}
            />
            <label htmlFor="matricula" className={styles.labelLine}>
              Usuário
            </label>
            </div>

            <div className={styles.inputPassword}>
              <input
                type={showPassword ? "text" : "password"}
                name="senha"
                placeholder=""
                value={form.senha}
                onChange={onChange}
              />
              <label htmlFor="senha" className={styles.labelLine}>
                Senha
              </label>
              {/*<span
                className={styles.iconEye}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </span>  */}

            </div>
            
            <p className={styles.forgotPassword}>
              Esqueceu a senha? <a href="/">Clique aqui.</a>
            </p>

            <button type="submit">Entrar</button>
          </form>
        </div>
      </div>

      <div className={styles.right}>
        <Imagem />
      </div>
    </div>
  );
}
