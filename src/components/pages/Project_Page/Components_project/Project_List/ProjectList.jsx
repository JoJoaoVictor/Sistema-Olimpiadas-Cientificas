// Importação de estilos CSS module para estilizar a lista
import styles from './ProjectList.module.css';

// Ícones para edição e exclusão
import { BsPencil, BsFillTrashFill } from 'react-icons/bs';

// React Router para navegação
import { Link } from 'react-router-dom';

// Tipagem com PropTypes
import PropTypes from 'prop-types';

// Componente de item de projeto no formato de lista
function ProjectList({
  id,
  name,
  difficultyLevel,
  abilityCode,
  createdAt,
  handleRemove,
  categoryName = '',    
  serieAno,
  phaseLevel,
  bnccTheme
}) {
  // Função que chama o handler de remoção quando o botão for clicado
  const remove = (e) => {
    e.preventDefault();
    handleRemove(id);
  };

  // Formata a data ISO para o padrão dd/mm/yyyy
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <li className={styles.list_item}>
      <div className={styles.list_content}>
        <div>
          {/* Nome do projeto em negrito */}
          <strong>{name}</strong>  
          <br />

          {/* Informações adicionais como dificuldade, código da habilidade e tema BNCC */}
          <span style={{ fontSize: '0.90em', color: '#555' }}>
            Dificuldade: {difficultyLevel}/5 - Código: {abilityCode}
            {bnccTheme ? ` - Tema: ${bnccTheme}` : ''}
          </span>

          {/* Informações complementares como categoria, data e série */}
          <span className={styles.date}>
            <p className={styles.categori_text}>
              {/* Círculo colorido da categoria (estilizado pelo nome em minúsculo) */}
              <span className={`${styles[categoryName.toLowerCase()]}`}></span>
              {categoryName} -
            </p>
            Última modificação {formatDate(createdAt)} 
            {serieAno ? ` - Série/Ano: ${serieAno}` : ''}
            {phaseLevel ? ` - Fase: ${phaseLevel}` : ''}
          </span>
        </div>

        {/* Botões de ação: Editar e Excluir */}
        <div className={styles.actions}>
          <Link className={styles.edit_btn} to={`/projetos/${id}`}>
            <BsPencil />
          </Link>
          <button className={styles.delete_btn} onClick={remove}>
            <BsFillTrashFill /> 
          </button>
        </div>
      </div>
    </li>
  );
}

// Tipagem das props esperadas no componente
ProjectList.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  difficultyLevel: PropTypes.number.isRequired,
  abilityCode: PropTypes.string.isRequired,
  createdAt: PropTypes.string,
  categoryName: PropTypes.string,
  handleRemove: PropTypes.func.isRequired,
  serieAno: PropTypes.string,
  phaseLevel: PropTypes.string,
  bnccTheme: PropTypes.string
};

export default ProjectList;
