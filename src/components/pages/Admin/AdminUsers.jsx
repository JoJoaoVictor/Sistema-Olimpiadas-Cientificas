import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './AdminUsers.module.css';
import useAuth from '../../../hooks/useAuth';
import { userService } from '../../../services/userService';
import api from '../../../services/api';

// Ícones
import { FiUsers, FiShield, FiClock } from 'react-icons/fi';
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
  STUDENT:   { label: 'Elaborador',color: '#fd7e14', bg: '#fff4e6', icon: <FaUserGraduate /> },
};

// NOVO: Meta para as cores dos Status
const STATUS_META = {
  PENDING:  { label: 'Em Análise', color: '#d97706', bg: '#fef3c7' },
  APPROVED: { label: 'Ativo',   color: '#059669', bg: '#d1fae5' },
  REJECTED: { label: 'Rejeitado',  color: '#dc2626', bg: '#fee2e2' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function AdminUsers() {
  const { signed, user } = useAuth();

  const [users,          setUsers]        = useState([]);
  const [loading,        setLoading]      = useState(true);
  const [searchTerm,     setSearchTerm]   = useState('');
  const [roleFilter,     setRoleFilter]   = useState('ALL');
  const [cityFilter,     setCityFilter]   = useState('ALL');
  const [statusFilter,   setStatusFilter] = useState('ALL'); // NOVO: Filtro de Status
  const [sortField,      setSortField]    = useState('name');
  const [sortDir,        setSortDir]      = useState('asc');

  // Modais
  const [userToDelete,   setUserToDelete]  = useState(null);
  const [profileUser,    setProfileUser]   = useState(null);
  const [profileStats,   setProfileStats]  = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Carregar usuários ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!signed) return;
    async function loadUsers() {
      setLoading(true);
      try {
        const data = await userService.getAllUsers();
        if (Array.isArray(data)) setUsers(data);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [signed]);

  // ── Abrir perfil + buscar stats ─────────────────────────────────────────────
  const openProfile = useCallback(async (user) => {
    setProfileUser(user);
    setProfileStats(null);
    setProfileLoading(true);
    try {
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
      console.error('Erro ao carregar stats:', err);
      setProfileStats({ questionsTotal: 0, examsTotal: 0 });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ── Aprovar / Rejeitar Usuário (NOVAS FUNÇÕES) ──────────────────────────────
  const handleApprove = async (id) => {
    try {
      const res = await api.post(`/api/v1/users/${id}/approve`);
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'APPROVED', is_active: true } : u));
        if (profileUser?.id === id) setProfileUser(prev => ({ ...prev, status: 'APPROVED', is_active: true }));
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao aprovar usuário');
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Tem certeza que deseja rejeitar o acesso deste usuário?")) return;
    try {
      const res = await api.post(`/api/v1/users/${id}/reject`);
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'REJECTED', is_active: false } : u));
        if (profileUser?.id === id) setProfileUser(prev => ({ ...prev, status: 'REJECTED', is_active: false }));
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao rejeitar usuário');
    }
  };

  const handleRevert = async (id) => {
    if(!window.confirm("Deseja voltar este usuário para a fila de análise?")) return;
    try {
      const res = await api.post(`/api/v1/users/${id}/revert`);
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'PENDING', is_active: false } : u));
        if (profileUser?.id === id) setProfileUser(prev => ({ ...prev, status: 'PENDING', is_active: false }));
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao reverter status do usuário');
    }
  };

  // ── Deletar e Alterar Cargo ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!userToDelete) return;
    const success = await userService.deleteUser(userToDelete.id);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } else {
      alert('Erro ao remover usuário.');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    const oldUsers = [...users];
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    if (profileUser?.id === id) setProfileUser(prev => ({ ...prev, role: newRole }));

    const success = await userService.updateUserRole(id, newRole);
    if (!success) {
      setUsers(oldUsers);
      alert('Erro ao atualizar cargo.');
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // ── Filtragem + ordenação ───────────────────────────────────────────────────
  const filteredUsers = users
    .filter(u => {
      const matchRole = roleFilter === 'ALL' || u.role?.toUpperCase() === roleFilter.toUpperCase();
      // Verifica também o status novo (se não tiver status no banco antigo, trata como APPROVED para não bugar a tela)
      const userStatus = u.status || 'APPROVED'; 
      const matchStatus = statusFilter === 'ALL' || userStatus === statusFilter;
      const userCidade = u.profile?.cidade?.trim() || '';
      const matchCity = cityFilter === 'ALL' || userCidade.toLowerCase() === cityFilter.trim().toLowerCase();
      const matchText = !searchTerm ? true : (
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchRole && matchCity && matchText && matchStatus;
    })
    .sort((a, b) => {
      const va = (a[sortField] || '').toString().toLowerCase();
      const vb = (b[sortField] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const uniqueCities = useMemo(() => {
    if (!users || users.length === 0) return [];
    const cidadesFiltradas = users.map(u => u.profile?.cidade?.trim()).filter(Boolean);
    return Array.from(new Set(cidadesFiltradas)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [users]);
  
  // ── Stats totais ─────────────────────────────────────────────────────────
  const countByRole = (role) => users.filter(u => u.role?.toUpperCase() === role).length;
  // NOVO: Contador de pendentes
  const countPending = users.filter(u => u.status === 'PENDING').length;

  const STAT_CARDS = [
    { label: 'Total',      value: users.length,          icon: <FiUsers />,             color: '#2c3e50' },
    { label: 'Na Fila',    value: countPending,          icon: <FiClock />,             color: '#d97706' },  
    { label: 'Admins',     value: countByRole('ADMIN'),    icon: <FaUserShield />,        color: '#6f42c1' },
    { label: 'Professores',value: countByRole('PROFESSOR'),icon: <FaChalkboardTeacher />, color: '#0d6efd' },
    { label: 'Elaborador', value: countByRole('STUDENT'),  icon: <FaUserGraduate />,      color: '#fd7e14' },
  ];

  const ROLE_TABS = [
    { key: 'ALL',       label: 'Todos' },
    { key: 'ADMIN',     label: 'Admins' },
    { key: 'PROFESSOR', label: 'Professores' },
    { key: 'REVISOR',   label: 'Revisores' },
    { key: 'STUDENT',   label: 'Elaboradores' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page_wrapper}>
      <div className={styles.container}>
        <div className={styles.header_section}>
          <div>
            <h1><FiShield style={{ marginRight: '10px' }} />Gerenciar Usuários</h1>
            <p>Administração de contas e permissões do sistema.</p>
          </div>
        </div>

        <div className={styles.stats_grid}>
          {STAT_CARDS.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
          ))}
        </div>

        {/* Adicionei o controle de status e cidades. Precisaremos atualizar o ToolBar depois! */}
        <ToolBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          cityFilter={cityFilter}
          onCityFilterChange={setCityFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          users={users}
          filteredUsers={filteredUsers} 
          cities={uniqueCities}
          roleTabsConfig={ROLE_TABS}
        />

        <p className={styles.result_count}>
          {loading ? 'Carregando...' : `${filteredUsers.length} usuário${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''}`}
        </p>

        <div className={styles.content_area}>
          {loading ? (
            <div className={styles.loading_state}><div className={styles.spinner} /></div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.empty_state}>
              <FiUsers size={40} color="#ccc" />
              <p>Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <>
              <UsersTable
                users={filteredUsers}
                sortField={sortField}
                sortDir={sortDir}
                onSort={toggleSort}
                onRoleChange={handleRoleChange}
                onViewProfile={openProfile}
                onDeleteClick={setUserToDelete}
                onApprove={handleApprove}  
                onReject={handleReject}    
                ROLE_META={ROLE_META}
                onRevert={handleRevert}
                STATUS_META={STATUS_META}  
                formatDate={formatDate}
              />

              <div className={styles.mobile_list}>
                {filteredUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    onViewProfile={openProfile}
                    onDeleteClick={setUserToDelete}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRevert={handleRevert}
                    ROLE_META={ROLE_META}
                    STATUS_META={STATUS_META}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
      </div>

      <ProfileModal
        profileUser={profileUser}
        profileStats={profileStats}
        profileLoading={profileLoading}
        onClose={() => setProfileUser(null)}
        onRoleChange={handleRoleChange}
        onDeleteClick={setUserToDelete}
        onApprove={handleApprove}
        onReject={handleReject}
        ROLE_META={ROLE_META}
        onRevert={handleRevert}
        STATUS_META={STATUS_META}
        formatDate={formatDate}
      />

      <DeleteConfirmationModal
        userToDelete={userToDelete}
        onConfirm={handleDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}

export default AdminUsers;