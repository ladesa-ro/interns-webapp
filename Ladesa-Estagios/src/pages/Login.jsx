import React from "react";
import LoginForm from "../components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Ladesa Estágios
        </h1>
        <p className="text-gray-500 mb-8">Faça login para continuar</p>

        {/* Chamando o nosso componente aqui */}
        <LoginForm />

        <div className="mt-6 text-sm">
          <a href="#" className="text-blue-600 hover:underline">
            Esqueceu a senha?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
