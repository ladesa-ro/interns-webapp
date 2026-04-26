import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function Login() {
  const [form, setForm] = useState({
    matricula: "",
    senha: "",
  }); //Objeto para armazenar os dados do formulário (tem outro jeito que é fazendo um useState para cada tipo const [senha, setSenha] mas ia ser uma gambiarra boa)

  const navigate = useNavigate(); //Serve pra mandar o usuário pra outra página (que é o Painel :D)

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

      console.log("Resposta da API:", data);

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

  return (
    <LoginForm
    form={form}
    onChange={handleChange}
    onSubmit={handleSubmit}
    />
  );
}