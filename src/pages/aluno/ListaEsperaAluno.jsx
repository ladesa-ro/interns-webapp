import styles from "./ListaEsperaAluno.module.css";

export default function ListaEsperaAluno() {
  const alunos = [
    {
      nome: "Letícia Soares Gomes Colman",
      turma: "3º B Informática",
    },
    {
      nome: "Ana Carolina Ferreira Silva",
      turma: "3º A Informática",
    },
    {
      nome: "João Pedro Almeida Santos",
      turma: "3º B Informática",
    },
    {
      nome: "Victor Henrique Ferreira Cardoso",
      turma: "3º B Informática",
      destaque: true,
    },
    {
      nome: "Gabriel Henrique Souza Lima",
      turma: "3º B Informática",
    },
    {
      nome: "Beatriz Fernandes Rocha",
      turma: "2º A Informática",
    },
    {
      nome: "Lucas Vinícius Martins Pereira",
      turma: "2º B Informática",
    },
    {
      nome: "Júlia Cristina Barbosa Melo",
      turma: "2º B Informática",
    },
    {
      nome: "Rafael Augusto Nogueira Castro",
      turma: "2º A Informática",
    },
  ];

  return (
    <main className={styles.pagina}>

      <div className={styles.titulo}>
        <h1>Lista de espera</h1>
      
      </div>

      <div className={styles.tabelaWrapper}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th className={styles.numeroHeader}>Nº</th>
              <th>Nome</th>
              <th>Turma</th>
            </tr>
          </thead>

          <tbody>
            {alunos.map((aluno, index) => (
              <tr
                key={index}
                className={aluno.destaque ? styles.destaque : ""}
              >
                <td className={styles.numero}>
                  {index + 1}º
                </td>

                <td>{aluno.nome}</td>

                <td>{aluno.turma}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </main>
  );
}