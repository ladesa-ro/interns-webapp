import React from 'react';
import styles from './LoginForm.module.css';
import Titulo from '../components/icons_Components/Icon_Logo_Comp';


export default function LoginForm({ form, onChange, onSubmit }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>

    <form onSubmit={onSubmit} className={styles.form}>
      <Titulo className={styles.logo} />

      <input
        type="text"
        name="matricula" 
        placeholder="Matrícula"
        value={form.matricula}
        onChange={onChange}
      />

      <input
        type="password"
        name="senha"
        placeholder="Senha"
        value={form.senha}
        onChange={onChange}
      />

      <button type="submit">Entrar</button>
    </form>
    </div>
    </div>
  );
}