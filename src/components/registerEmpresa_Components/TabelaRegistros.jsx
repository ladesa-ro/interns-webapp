import React, { useState, useEffect } from 'react';
import Styles from '../../components/registerEmpresa_Components/tabelaRegistros.module.css';
import Pesquisa from '../icons_Components/Icon_Pesquisa_Comp';
import Editar from '../icons_Components/Icon_Editar_Comp';
import Deletar from '../icons_Components/Icon_Deletar_Comp';
import { useNavigate } from 'react-router-dom';

export default function TabelaRegistros() {

  const navigate = useNavigate();


  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState('');


  // PAGINAÇÃO
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const limite = 20;

  const [modalAberto, setModalAberto] = useState(false);

  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  const empresasFiltradas = empresas.filter((empresa) =>
    (empresa.nomeFantasia || '')
      .toLowerCase()
      .includes(busca.toLowerCase()) ||

    (empresa.cnpj || '')
      .includes(busca)

  );



  useEffect(() => {


    setLoading(true);


    fetch(
      `https://dev.ladesa.com.br/api/v1/empresas?page=${pagina}&limit=${limite}`
    )

    .then((response)=>{


      if(!response.ok){

        throw new Error(
          `Erro HTTP: ${response.status}`
        );

      }


      return response.json();


    })


    .then((dados)=>{


      console.log(dados);


      setEmpresas(
        dados.data || []
      );


      if(dados.meta){


        setTotalPaginas(

          Math.ceil(
            dados.meta.totalPages
          )

        );

      }


      setLoading(false);



    })


    .catch((error)=>{


      console.error(
        "Erro ao buscar empresas:",
        error
      );


      setEmpresas([]);

      setLoading(false);


    });



  },[pagina]);





  const excluirEmpresa = async () => {


    try {


      const response = await fetch(

        `https://dev.ladesa.com.br/api/v1/empresas/${empresaSelecionada.id}`,

        {

          method:'DELETE'

        }

      );



      if(!response.ok){

        throw new Error(
          `Erro HTTP: ${response.status}`
        );

      }



      setEmpresas(

        empresas.filter(

          empresa =>
          empresa.id !== empresaSelecionada.id

        )

      );



      setModalAberto(false);

      setEmpresaSelecionada(null);



    }

    catch(error){


      console.error(
        "Erro ao excluir:",
        error
      );


    }


  };





  if(loading){

    return <p>Carregando empresas...</p>;

  }





  return (

    <div className={Styles.container}>


      <div className={Styles.searchContainer}>


        <Pesquisa size={40}/>


        <input

          type="text"

          placeholder="Buscar por nome ou CNPJ..."

          value={busca}

          onChange={(e)=>
            setBusca(e.target.value)
          }

        />


      </div>





      <table className={Styles.table}>


        <thead>


          <tr>

            <th>Nome Fantasia</th>

            <th>CNPJ</th>

            <th>Telefone</th>

            <th>Email</th>

            <th>Cidade</th>

            <th>Ações</th>


          </tr>


        </thead>




        <tbody>


        {

        empresasFiltradas.map((empresa)=>(


          <tr key={empresa.id}>


            <td>
              {empresa.nomeFantasia}
            </td>


            <td>
              {empresa.cnpj}
            </td>


            <td>
              {empresa.telefone}
            </td>


            <td>
              {empresa.email}
            </td>


            <td>
              {empresa.endereco?.cidade?.nome}
            </td>



            <td className={Styles.actions}>


              <button

                title="Editar"

                onClick={()=>

                  navigate(
                    `/editar-empresa/${empresa.id}`
                  )

                }

              >

                <Editar/>

              </button>




              <button

                title="Excluir"

                onClick={()=>{

                  setEmpresaSelecionada(empresa);

                  setModalAberto(true);

                }}

              >

                <Deletar/>

              </button>


            </td>


          </tr>


        ))

        }




        </tbody>


      </table>





      {/* PAGINAÇÃO */}

      <div className={Styles.pagination}>


        <button

          disabled={pagina === 1}

          onClick={()=>setPagina(pagina - 1)}

        >

          Anterior

        </button>




        <span>

          Página {pagina} de {totalPaginas}

        </span>




        <button

          disabled={pagina === totalPaginas}

          onClick={()=>setPagina(pagina + 1)}

        >

          Próxima

        </button>


      </div>







      {/* MODAL DELETE */}



      {modalAberto && (


        <div className={Styles.overlay}>


          <div className={Styles.modal}>


            <h3>
              Excluir Empresa
            </h3>



            <p>

              Deseja realmente excluir a empresa

              <strong>

                {' '}

                {empresaSelecionada?.nomeFantasia}

              </strong>

              ?

            </p>




            <div className={Styles.modalButtons}>


              <button

                className={Styles.cancelButton}

                onClick={()=>{

                  setModalAberto(false);

                  setEmpresaSelecionada(null);

                }}

              >

                Cancelar

              </button>




              <button

                className={Styles.deleteButton}

                onClick={excluirEmpresa}

              >

                Excluir

              </button>



            </div>


          </div>


        </div>


      )}



    </div>

  );


}