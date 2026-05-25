import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './AdminUsers.module.css';
import useAuth from '../../../hooks/useAuth';
import { userService } from '../../../services/userService';
import api from '../../../services/api';

// Ícones
import { FiUsers, FiShield } from 'react-icons/fi';
import { FaChalkboardTeacher, FaUserGraduate, FaUserShield, FaUserCheck } from 'react-icons/fa';

// Componentes
import StatCard from './AdminUsersComponents/StatCard';
import ToolBar from './AdminUsersComponents/ToolBar';
import UsersTable from './AdminUsersComponents/UsersTable';
import UserCard from './AdminUsersComponents/UserCard';
import ProfileModal from './AdminUsersComponents/ProfileModal';
import DeleteConfirmationModal from './AdminUsersComponents/DeleteConfirmationModal';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_META = {
  ADMIN:     { label: 'Admin',     color: '#6f42c1', bg: '#f0eaff', icon: <FaUserShield /> },
  PROFESSOR: { label: 'Professor', color: '#0d6efd', bg: '#e7f0ff', icon: <FaChalkboardTeacher /> },
  REVISOR:   { label: 'Revisor',   color: '#0ca678', bg: '#e6fcf5', icon: <FaUserCheck /> },
  STUDENT:   { label: 'Estudante', color: '#fd7e14', bg: '#fff4e6', icon: <FaUserGraduate /> },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function AdminUsers() {
  const { token } = useAuth();

  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [roleFilter,   setRoleFilter]   = useState('ALL');
  const [cityFilter,   setCityFilter]   = useState('ALL');
  const [sortField,    setSortField]    = useState('name');
  const [sortDir,      setSortDir]      = useState('asc');

  // Modais
  const [userToDelete,  setUserToDelete]  = useState(null);
  const [profileUser,   setProfileUser]   = useState(null);  // modal de perfil
  const [profileStats,  setProfileStats]  = useState(null);  // dados carregados
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Carregar usuários ────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadUsers() {
      if (!token) return;
      setLoading(true);
      try {
        const data = await userService.getAllUsers(token);
        if (Array.isArray(data)) setUsers(data);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [token]);

  // ── Abrir perfil + buscar stats REAIS e individuais do usuário ────────────────
  const openProfile = useCallback(async (user) => {
    setProfileUser(user);
    setProfileStats(null);
    setProfileLoading(true);
    try {
      // 🌟 MUDANÇA REALIZADA: Consome a nova rota focada nas estatísticas individuais
      const response = await api.get(`/api/v1/users/${user.id}/stats`);
      
      if (response.data && response.data.success) {
        setProfileStats({
          questionsTotal: response.data.data.questionsTotal ?? 0,
          examsTotal: response.data.data.examsTotal ?? 0
        });
      } else {
        setProfileStats({ questionsTotal: 0, examsTotal: 0 });
      }
    } catch (err) {
      console.error('Erro ao carregar stats reais do usuário:', err);
      setProfileStats({ questionsTotal: 0, examsTotal: 0 });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ── Deletar usuário ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!userToDelete) return;
    const success = await userService.deleteUser(userToDelete.id, token);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } else {
      alert('Erro ao remover usuário.');
    }
  };

  // ── Alterar cargo ────────────────────────────────────────────────────────────
  const handleRoleChange = async (id, newRole) => {
    const oldUsers = [...users];
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    // Atualiza modal de perfil se estiver aberto para este user
    if (profileUser?.id === id) setProfileUser(prev => ({ ...prev, role: newRole }));

    const success = await userService.updateUserRole(id, newRole, token);
    if (!success) {
      setUsers(oldUsers);
      alert('Erro ao atualizar cargo.');
    }
  };

  // ── Ordenação ────────────────────────────────────────────────────────────────
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // ── Filtragem + ordenação (Corrigido para o Schema Pydantic) ─────────────────
  const filteredUsers = users
    .filter(u => {
      // 1. Filtro de Cargo (Role)
      const matchRole = roleFilter === 'ALL' || u.role?.toUpperCase() === roleFilter.toUpperCase();
      
      // 2. Filtro de Cidade (Polo) - Lendo do sub-objeto profile.cidade
      const userCidade = u.profile?.cidade?.trim() || '';
      const matchCity = cityFilter === 'ALL' || 
        userCidade.toLowerCase() === cityFilter.trim().toLowerCase();
        
      // 3. Filtro de Busca por texto (Nome ou Email)
      const matchText = !searchTerm ? true : (
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return matchRole && matchCity && matchText;
    })
    .sort((a, b) => {
      const va = (a[sortField] || '').toString().toLowerCase();
      const vb = (b[sortField] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  // ── Obter cidades únicas padronizadas (Corrigido para o Schema Pydantic) ─────
  const uniqueCities = useMemo(() => {
    if (!users || users.length === 0) return [];
    
    const cidadesFiltradas = users
      .map(u => u.profile?.cidade?.trim()) // 👈 Acessa u.profile.cidade
      .filter(Boolean);                   // Remove nulos ou vazios

    return Array.from(new Set(cidadesFiltradas)).sort((a, b) => 
      a.localeCompare(b, 'pt-BR')
    );
  }, [users]);
  
  // ── Stats totais ─────────────────────────────────────────────────────────────
  const countByRole = (role) => users.filter(u => u.role?.toUpperCase() === role).length;

  const STAT_CARDS = [
    { label: 'Total',      value: users.length,           icon: <FiUsers />,              color: '#2c3e50' },
    { label: 'Admins',     value: countByRole('ADMIN'),    icon: <FaUserShield />,         color: '#6f42c1' },
    { label: 'Professores',value: countByRole('PROFESSOR'),icon: <FaChalkboardTeacher />,  color: '#0d6efd' },
    { label: 'Revisores',  value: countByRole('REVISOR'),  icon: <FaUserCheck />,          color: '#0ca678' },
    { label: 'Estudantes', value: countByRole('STUDENT'),  icon: <FaUserGraduate />,       color: '#fd7e14' },
  ];

  const ROLE_TABS = [
    { key: 'ALL',      label: 'Todos' },
    { key: 'ADMIN',    label: 'Admins' },
    { key: 'PROFESSOR',label: 'Professores' },
    { key: 'REVISOR',  label: 'Revisores' },
    { key: 'STUDENT',  label: 'Estudantes' },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page_wrapper}>
      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.header_section}>
          <div>
            <h1><FiShield style={{ marginRight: '10px' }} />Gerenciar Usuários</h1>
            <p>Administração de contas e permissões do sistema.</p>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className={styles.stats_grid}>
          {STAT_CARDS.map(s => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              color={s.color}
            />
          ))}
        </div>

        {/* ── Toolbar ── */}
        <ToolBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          cityFilter={cityFilter}
          onCityFilterChange={setCityFilter}
          users={users}
          filteredUsers={filteredUsers} 
          cities={uniqueCities}
          roleTabsConfig={ROLE_TABS}
        />

        {/* ── Resultado ── */}
        <p className={styles.result_count}>
          {loading ? 'Carregando...' : `${filteredUsers.length} usuário${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── Conteúdo ── */}
        <div className={styles.content_area}>
          {loading ? (
            <div className={styles.loading_state}>
              <div className={styles.spinner} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.empty_state}>
              <FiUsers size={40} color="#ccc" />
              <p>Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <>
              {/* TABELA (Desktop) - 🌟 Removido parâmetro obsoleto avatarUrl */}
              <UsersTable
                users={filteredUsers}
                sortField={sortField}
                sortDir={sortDir}
                onSort={toggleSort}
                onRoleChange={handleRoleChange}
                onViewProfile={openProfile}
                onDeleteClick={setUserToDelete}
                ROLE_META={ROLE_META}
                formatDate={formatDate}
              />

              {/* CARDS (Mobile) - 🌟 Removido parâmetro obsoleto avatarUrl e corrigido bug de carregamento */}
              <div className={styles.mobile_list}>
                {filteredUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    onViewProfile={openProfile}
                    onDeleteClick={setUserToDelete}
                    ROLE_META={ROLE_META}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modal: Perfil do Usuário ── - 🌟 Removido parâmetro obsoleto avatarUrl */}
      <ProfileModal
        profileUser={profileUser}
        profileStats={profileStats}
        profileLoading={profileLoading}
        onClose={() => setProfileUser(null)}
        onRoleChange={handleRoleChange}
        onDeleteClick={setUserToDelete}
        ROLE_META={ROLE_META}
        formatDate={formatDate}
      />

      {/* ── Modal: Confirmar Exclusão ── */}
      <DeleteConfirmationModal
        userToDelete={userToDelete}
        onConfirm={handleDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}

export default AdminUsers;