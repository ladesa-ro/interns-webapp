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
            <input
              type="text"
              name="matricula"
              placeholder="Insira seu usuário"
              value={form.matricula}
              onChange={onChange}
            />

            <div className={styles.inputPassWord}>
              <input
                type={showPassword ? "text" : "password"}
                name="senha"
                placeholder="Insira sua senha"
                value={form.senha}
                onChange={onChange}
              />
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
