import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  const navigate = useNavigate();

  function handleChange({ target }) {
    const { name, value } = target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // 🔥 simulação de login
    if (form.email === "admin@gmail.com" && form.senha === "123") {
      const fakeToken = "abc123";

      localStorage.setItem("token", fakeToken);

      navigate("/painel");
    } else {
      alert("Login inválido");
    }
  }

  // 🔒 impede acessar login estando logado
  if (localStorage.getItem("token")) {
    return <Navigate to="/painel" />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        type="password"
        name="senha"
        placeholder="Senha"
        value={form.senha}
        onChange={handleChange}
      />

      <button type="submit">Entrar</button>
    </form>
  );
}