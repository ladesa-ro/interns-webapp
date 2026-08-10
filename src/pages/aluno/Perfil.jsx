import { useState } from "react";

import styles from "./Perfil.module.css";

import {
  Mail,
  Users,
  User,
  Phone,
  Camera,
  Pencil,
  X,
  Plus,
} from "lucide-react";

export default function Perfil() {
  // Controla a abertura e fechamento do modal
  const [modalEmail, setModalEmail] = useState(false);

  // Lista de emails
  const [emails, setEmails] = useState([
    "vt.henrique@gmail.com",
  ]);

  // Guarda o email que está sendo digitado
  const [novoEmail, setNovoEmail] = useState("");

  // Adiciona um novo email
  function adicionarEmail() {
    const email = novoEmail.trim();

    // Não deixa adicionar vazio
    if (email === "") return;

    // Verifica se o email já existe
    if (emails.includes(email)) {
      alert("Esse email já foi adicionado.");
      return;
    }

    // Adiciona o novo email na lista
    setEmails([...emails, email]);

    // Limpa o campo
    setNovoEmail("");
  }

  // Remove um email adicional
  function removerEmail(index) {
    const novosEmails = emails.filter((_, i) => i !== index);

    setEmails(novosEmails);
  }

  // Salva e fecha o modal
  function salvarEmails() {
    setModalEmail(false);
  }

  return (
    <div className={styles.perfilPage}>

      {/* ================= CARD PRINCIPAL ================= */}

      <div className={styles.perfilCard}>

        {/* ================= LADO ESQUERDO ================= */}

        <div className={styles.perfilEsquerda}>

          <div className={styles.fotoContainer}>

            <img
              src="/image.png"
              alt="Foto de perfil"
              className={styles.fotoPerfil}
            />

            <button className={styles.cameraBtn}>
              <Camera size={18} />
            </button>

          </div>

          <h2>Victor Henrique</h2>

        </div>

        {/* LINHA DIVISÓRIA */}

        <div className={styles.linha}></div>

        {/* ================= LADO DIREITO ================= */}

        <div className={styles.perfilDireita}>

          {/* ================= EMAIL ================= */}

          <div className={styles.infoCard}>

            {/* Botão editar */}

            <button
              className={styles.editar}
              onClick={() => setModalEmail(true)}
            >
              <Pencil size={12} />
              <span>Editar</span>
            </button>

            <Mail size={20} />

            <div className={styles.emailCardContent}>

              <h3>Email</h3>

              {/* MOSTRA TODOS OS EMAILS */}

              <div className={styles.listaEmailsCard}>

                {emails.map((email, index) => (
                  <p key={index}>
                    {email}
                  </p>
                ))}

              </div>

            </div>

          </div>

          {/* ================= TURMA ================= */}

          <div className={styles.infoCard}>

            <Users size={20} />

            <div>
              <h3>Turma</h3>

              <p>2º B Informática</p>
            </div>

          </div>

          {/* ================= NOME ================= */}

          <div className={styles.infoCard}>

            <User size={20} />

            <div>
              <h3>Nome</h3>

              <p>
                Victor Henrique Ferreira Cardoso
              </p>
            </div>

          </div>

          {/* ================= TELEFONE ================= */}

          <div className={styles.infoCard}>

            <Phone size={20} />

            <div>
              <h3>Telefone</h3>

              <p>
                (69) 9 9987-9742
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          MODAL DE EMAIL
      ===================================================== */}

      {modalEmail && (

        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            // Fecha somente se clicar no fundo
            if (e.target === e.currentTarget) {
              setModalEmail(false);
            }
          }}
        >

          <div className={styles.modal}>

            {/* ================= CABEÇALHO ================= */}

            <div className={styles.modalHeader}>

              <div className={styles.modalTitle}>

                <Mail size={22} />

                <h2>
                  Editar emails
                </h2>

              </div>

              <button
                className={styles.fecharModal}
                onClick={() => setModalEmail(false)}
              >
                <X size={20} />
              </button>

            </div>

            {/* ================= CONTEÚDO ================= */}

            <div className={styles.modalContent}>

              <p className={styles.modalDescricao}>
                Gerencie os emails vinculados ao seu perfil.
              </p>

              {/* ================= EMAILS EXISTENTES ================= */}

              <div className={styles.emailLista}>

                {emails.map((email, index) => (

                  <div
                    className={styles.emailItem}
                    key={index}
                  >

                    <div className={styles.emailItemInfo}>

                      <span>
                        {index === 0
                          ? "Principal"
                          : "Email adicional"}
                      </span>

                      <p>
                        {email}
                      </p>

                    </div>

                    {/* Só permite remover emails adicionais */}

                    {index !== 0 && (

                      <button
                        className={styles.removerEmail}
                        onClick={() => removerEmail(index)}
                        title="Remover email"
                      >
                        <X size={17} />
                      </button>

                    )}

                  </div>

                ))}

              </div>

              {/* ================= ADICIONAR EMAIL ================= */}

              <div className={styles.novoEmail}>

                <label>
                  Adicionar email
                </label>

                <div className={styles.inputEmail}>

                  <Mail size={18} />

                  <input
                    type="email"
                    placeholder="Digite um novo email"
                    value={novoEmail}
                    onChange={(e) =>
                      setNovoEmail(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        adicionarEmail();
                      }
                    }}
                  />

                </div>

                <button
                  className={styles.btnAdicionar}
                  onClick={adicionarEmail}
                >
                  <Plus size={18} />

                  Adicionar email
                </button>

              </div>

            </div>

            {/* ================= RODAPÉ ================= */}

            <div className={styles.modalFooter}>

              <button
                className={styles.btnCancelar}
                onClick={() => setModalEmail(false)}
              >
                Cancelar
              </button>

              <button
                className={styles.btnSalvar}
                onClick={salvarEmails}
              >
                Salvar alterações
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}