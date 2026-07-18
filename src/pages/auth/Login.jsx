import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import apiFetch from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ matricula: "", senha: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange({ target }) {
    const { name, value } = target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await apiFetch("/autenticacao/login", {
        method: "POST",
        body: JSON.stringify({
          matricula: form.matricula,
          senha: form.senha,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        // O AuthContext detecta o perfil e retorna "aluno" ou "admin"
        const perfil = login(data.access_token);

        if (perfil === "aluno") {
          navigate("/aluno");
        } else {
          navigate("/");
        }
      } else {
        alert("Login inválido. Verifique matrícula e senha.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao conectar com o servidor.");
    }
  }

  return <LoginForm form={form} onChange={handleChange} onSubmit={handleSubmit} />;
}