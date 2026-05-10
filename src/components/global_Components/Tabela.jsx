import React from 'react';
import styles from "./Tabela.module.css";
const empresas = [{
    nome: "Tech Solutions",
    curso: "Informática",
    contato: "techsolutions@gmail.com"
},
{
    nome: "Inova Digital",
    curso: "Informática",
    contato: "inovadigital@gmail.com"
},
{
    nome: "Laboratório BioVida",
    curso: "Química",
    contato: "biovida@gmail.com"
},
{
    nome: "QuimLab Análise",
    curso: "Química",
    contato: "quimlab@gmail.com"
},
{
    nome: "Floresta Viva",
    curso: "Floresta",
    contato: "floresta@gmail.com"
}

];
const Tabela = () => {
  return (
    <div className={styles.tabela}>
        <table>
            <thead>
                <tr className={styles.titulo}>
                    <th>Nome da Empresa</th>
                    <th>Curso</th>
                    <th>Contato</th>
                </tr>
            </thead>
            <tbody>
                {empresas.map((empresa, index) => (
                    <tr key={index} className={styles.linha}>
                        <td>{empresa.nome}</td>
                        <td>{empresa.curso}</td>
                        <td>{empresa.contato}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default Tabela;