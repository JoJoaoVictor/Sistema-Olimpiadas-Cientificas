// Importação de estilos CSS module para estilizar a lista
import styles from './ProjectList.module.css';

// Ícones para edição e exclusão
import { BsPencil, BsFillTrashFill, BsCalendar3, BsBarChart, BsCodeSlash } from 'react-icons/bs';

// React Router para navegação
import { Link } from 'react-router-dom';

// Tipagem com PropTypes
import PropTypes from 'prop-types';

function ProjectList({
  id,
  name,
  difficultyLevel,
  abilityCode,
  createdAt,
  handleRemove,
  categoryName = 'Sem Categoria',    
  serieAno,
  phaseLevel,
  bnccTheme
}) {

  const remove = (e) => {
    e.preventDefault();
    handleRemove(id);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Data indefinida';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  // Lógica de Estilo: Transforma "Correção Solicitada" em "correcao_solicitada"
  // para usar como classe no CSS sem dar erro.
  const getStatusClass = (status) => {
      if (!status) return styles.default_status;
      const normalized = status.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/\s+/g, '_'); // Troca espaço por underline
      return styles[normalized] || styles.default_status;
  };

  return (
    <li className={styles.project_card}>
      
      {/* 1. Cabeçalho do Card: Título e Tema */}
      <div className={styles.card_header}>
         <h3 className={styles.title}>{name}</h3>
         {bnccTheme && <span className={styles.theme_badge}>{bnccTheme}</span>}
      </div>

      {/* 2. Corpo do Card: Grid de Informações */}
      <div className={styles.card_body}>
        <div className={styles.info_group}>
           <span className={styles.info_label}><BsBarChart /> Dificuldade</span>
           <span className={styles.info_value}>{difficultyLevel}/5</span>
        </div>
        
        <div className={styles.info_group}>
           <span className={styles.info_label}><BsCodeSlash /> Código</span>
           <span className={styles.info_value}>{abilityCode}</span>
        </div>

        <div className={styles.info_group}>
           <span className={styles.info_label}>Série/Ano</span>
           <span className={styles.info_value}>{serieAno || '-'}</span>
        </div>

        {phaseLevel && (
            <div className={styles.info_group}>
               <span className={styles.info_label}>Nivel/Categoria</span>
               <span className={styles.info_value}>{phaseLevel}</span>
            </div>
        )}
      </div>

      {/* 3. Rodapé do Card: Data, Status e Botões */}
      <div className={styles.card_footer}>
        <div className={styles.meta_data}>
            {/* Tag de Status Colorida */}
            <span className={`${styles.status_badge} ${getStatusClass(categoryName)}`}>
               {categoryName}
            </span>
            
            <span className={styles.date_text}>
               <BsCalendar3 /> {formatDate(createdAt)}
            </span>
        </div>

        {/* Botões de Ação */}
        <div className={styles.actions}>
          <Link className={styles.edit_btn} to={`/projetos/${id}`} title="Editar">
            <BsPencil />
          </Link>
          <button className={styles.delete_btn} onClick={remove} title="Excluir">
            <BsFillTrashFill /> 
          </button>
        </div>
      </div>
    </li>
  );
}

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