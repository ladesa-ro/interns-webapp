import React from 'react';

export default function TabelaRegistros() {
  return (
    <div>
      <div>
          <div>
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
            />
          </div>
        </div>
        <table>
          <thead>
          </thead>
          <tbody>
          </tbody>  
        </table>
    </div>
  );
}