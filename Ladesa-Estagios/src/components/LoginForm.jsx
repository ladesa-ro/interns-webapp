import React from 'react';
import styles from './LoginForm.module.css';
import Titulo from '../components/icons_Components/Icon_Logo_Comp';
import Imagem from '../components/image_Components/Image_Login_Comp';


export default function LoginForm({ form, onChange, onSubmit }) {
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

      <input
        type="password"
        name="senha"
        placeholder="Insira sua senha"
        value={form.senha}
        onChange={onChange}
      />

      <p>Esqueceu a senha? <a href="/">Clique aqui.</a></p>

      <button type="submit">Entrar</button>
    </form>
    </div>
    </div>
    <div className={styles.right}>
    <Imagem/>
    </div>
    </div>
  );
}