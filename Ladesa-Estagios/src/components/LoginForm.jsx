import React, { useState } from "react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Tentando logar com:", { email, password });
    // Aqui você chamaria sua API
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <div>
        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input
          type="email"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Senha</label>
        <input
          type="password"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Entrar
      </button>
    </form>
  );
};

export default LoginForm;
