import React from 'react';
import styles from "./Tabela.module.css";

const Tabela = ({ colunas, dados }) => {
    return (
        <div className={styles.tabela}>
            <table>
                <thead>
                    <tr className={styles.titulo}>
                        {colunas.map((coluna) => (
                            <th key={coluna.chave}>
                                {coluna.label}
                            </th>))}
                    </tr>
                </thead>
                <tbody>
                    {dados.map((item) => (
                        <tr key={item.id} className={styles.linha}>
                            {colunas.map((coluna) => (
                                <td key={coluna.chave}>
                                    {item[coluna.chave]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Tabela;