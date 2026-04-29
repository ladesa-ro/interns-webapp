import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";

export default function Login() {
  const [form, setForm] = useState({
    matricula: "",
    senha: "",
  });

  const navigate = useNavigate();

  function handleChange({ target }) {
    const { name, value } = target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://dev.ladesa.com.br/api/v1/autenticacao/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matricula: form.matricula,
            senha: form.senha,
          }),
        }
      );

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        navigate("/");
      } else {
        alert("Login inválido");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao conectar com o servidor");
    }
  }

  return <LoginForm form={form} onChange={handleChange} onSubmit={handleSubmit} />;
}
