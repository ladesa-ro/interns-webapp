import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import { useAuth } from "../../contexts/AuthContext";
import { PERFIL_ALUNO } from "../../contexts/perfis";
import { mensagemDeErro } from "../../utils/api";

export default function Login() {
  const [form, setForm] = useState({ matricula: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange({ target }) {
    const { name, value } = target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!form.matricula.trim() || !form.senha) {
      setErro("Informe matrícula e senha.");
      return;
    }

    setEnviando(true);

    try {
      const sessao = await login(form.matricula.trim(), form.senha);

      if (!sessao.autenticado) {
        setErro("Matrícula ou senha inválidos.");
        return;
      }

      if (!sessao.perfil) {
        setErro(sessao.erroPerfil);
        return;
      }

      navigate(sessao.perfil === PERFIL_ALUNO ? "/aluno" : "/", { replace: true });
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LoginForm
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      erro={erro}
      enviando={enviando}
    />
  );
}
