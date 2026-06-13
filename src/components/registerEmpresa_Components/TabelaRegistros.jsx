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


  const [pagina, setPagina] = useState(1);


  const limite = 20;



  const [modalAberto,setModalAberto] = useState(false);
  const [empresaSelecionada,setEmpresaSelecionada] = useState(null);



  // BUSCA TODAS AS EMPRESAS UMA VEZ

  useEffect(()=>{


    fetch(
      "https://dev.ladesa.com.br/api/v1/empresas?limit=200"
    )

    .then(res=>res.json())

    .then(dados=>{


      setEmpresas(
        dados.data || []
      );


      setLoading(false);


    })


    .catch(error=>{

      console.error(error);

      setLoading(false);

    })


  },[]);





  // FILTRO LOCAL

  const empresasFiltradas = empresas.filter((empresa)=>{


    const nome =
    empresa.nomeFantasia?.toLowerCase() || "";


    const cnpj =
    empresa.cnpj || "";



    return (

      nome.includes(
        busca.toLowerCase()
      )

      ||

      cnpj.includes(busca)

    );


  });





  // PAGINAÇÃO LOCAL


  const totalPaginas = Math.ceil(
    empresasFiltradas.length / limite
  );



  const inicio = 
  (pagina - 1) * limite;



  const empresasPagina =
  empresasFiltradas.slice(
    inicio,
    inicio + limite
  );





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


onChange={(e)=>{

setBusca(e.target.value);

setPagina(1);

}}


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

empresasPagina.map((empresa)=>(


<tr key={empresa.id}>


<td>{empresa.nomeFantasia}</td>

<td>{empresa.cnpj}</td>

<td>{empresa.telefone}</td>

<td>{empresa.email}</td>

<td>
{empresa.endereco?.cidade?.nome}
</td>


<td className={Styles.actions}>


<button
onClick={()=>navigate(
`/editar-empresa/${empresa.id}`
)}
>

<Editar/>

</button>



<button

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





<div className={Styles.pagination}>


<button

disabled={pagina===1}

onClick={()=>setPagina(pagina-1)}

>

Anterior

</button>




<span>

Página {pagina} de {totalPaginas}

</span>





<button

disabled={pagina===totalPaginas}

onClick={()=>setPagina(pagina+1)}

>

Próxima

</button>



</div>





</div>


)


}