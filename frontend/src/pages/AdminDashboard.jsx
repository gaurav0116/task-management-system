import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    // Project Form
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [projectUsers, setProjectUsers] = useState([]);
    const [projectErrors, setProjectErrors] = useState({});

    // Task Form
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [taskProject, setTaskProject] = useState('');
    const [taskUser, setTaskUser] = useState('');
    const [taskErrors, setTaskErrors] = useState({});

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Yup Schemas
    const projectSchema = yup.object().shape({
        title: yup.string().required('Title is required'),
        description: yup.string().required('Description is required'),
        // assignedUsers is optional or check min length? skipping for now
    });

    const taskSchema = yup.object().shape({
        title: yup.string().required('Title is required'),
        description: yup.string().required('Description is required'),
        projectId: yup.string().required('Project is required'),
        assignedUser: yup.string().required('Assigned User is required'),
    });

    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/projects', config);
            setProjects(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch projects');
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/auth/users', config);
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch users');
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setProjectErrors({});
        
        try {
            await projectSchema.validate({ title: projectTitle, description: projectDesc }, { abortEarly: false });
        } catch (err) {
            const newErrors = {};
            err.inner.forEach(e => newErrors[e.path] = e.message);
            setProjectErrors(newErrors);
            return;
        }

        try {
            await axios.post('http://localhost:5001/api/projects', {
                title: projectTitle,
                description: projectDesc,
                assignedUsers: projectUsers
            }, config);
            fetchProjects();
            setProjectTitle('');
            setProjectDesc('');
            setProjectUsers([]);
            toast.success('Project Created');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating project');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setTaskErrors({});

        try {
            await taskSchema.validate({ 
                title: taskTitle, 
                description: taskDesc, 
                projectId: taskProject,
                assignedUser: taskUser 
            }, { abortEarly: false });
        } catch (err) {
             const newErrors = {};
            err.inner.forEach(e => newErrors[e.path] = e.message);
            setTaskErrors(newErrors);
            return;
        }

        try {
            await axios.post('http://localhost:5001/api/tasks', {
                title: taskTitle,
                description: taskDesc,
                projectId: taskProject,
                assignedUser: taskUser
            }, config);
            toast.success('Task Created');
            setTaskTitle('');
            setTaskDesc('');
            setTaskProject('');
            setTaskUser('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating task');
        }
    };

    const handleUserSelect = (userId) => {
        setProjectUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    return (
        <div className="dashboard-container">
            <header>
                <h1>Admin Dashboard</h1>
                <p>Welcome, {user?.name}</p>
                <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
            </header>

            <div className="admin-grid">
                <section>
                    <h3>Create Project</h3>
                    <form onSubmit={handleCreateProject} noValidate>
                        <input 
                            type="text" 
                            placeholder="Title" 
                            value={projectTitle} 
                            onChange={e => setProjectTitle(e.target.value)} 
                            className={projectErrors.title ? 'input-error' : ''}
                        />
                         {projectErrors.title && <span className="error-text">{projectErrors.title}</span>}
                        
                        <textarea 
                            placeholder="Description" 
                            value={projectDesc} 
                            onChange={e => setProjectDesc(e.target.value)} 
                            className={projectErrors.description ? 'input-error' : ''}
                        />
                        {projectErrors.description && <span className="error-text">{projectErrors.description}</span>}
                        
                        <div>
                            <p>Assign Users:</p>
                            {users.map(u => (
                                <label key={u._id} style={{display: 'block'}}>
                                    <input 
                                        type="checkbox" 
                                        checked={projectUsers.includes(u._id)}
                                        onChange={() => handleUserSelect(u._id)}
                                    />
                                    {u.name} ({u.email})
                                </label>
                            ))}
                        </div>
                        <button type="submit">Create Project</button>
                    </form>
                </section>

                <section>
                    <h3>Create Task</h3>
                    <form onSubmit={handleCreateTask} noValidate>
                        <input 
                            type="text" 
                            placeholder="Title" 
                            value={taskTitle} 
                            onChange={e => setTaskTitle(e.target.value)} 
                            className={taskErrors.title ? 'input-error' : ''}
                        />
                        {taskErrors.title && <span className="error-text">{taskErrors.title}</span>}

                        <textarea 
                            placeholder="Description" 
                            value={taskDesc} 
                            onChange={e => setTaskDesc(e.target.value)} 
                            className={taskErrors.description ? 'input-error' : ''}
                        />
                         {taskErrors.description && <span className="error-text">{taskErrors.description}</span>}

                        <select 
                            value={taskProject} 
                            onChange={e => setTaskProject(e.target.value)} 
                            className={taskErrors.projectId ? 'input-error' : ''}
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.title}</option>
                            ))}
                        </select>
                        {taskErrors.projectId && <span className="error-text">{taskErrors.projectId}</span>}

                        <select 
                            value={taskUser} 
                            onChange={e => setTaskUser(e.target.value)}
                            className={taskErrors.assignedUser ? 'input-error' : ''}
                        >
                            <option value="">Select User</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name}</option>
                            ))}
                        </select>
                        {taskErrors.assignedUser && <span className="error-text">{taskErrors.assignedUser}</span>}
                        <button type="submit">Create Task</button>
                    </form>
                </section>
            </div>

            <section>
                <h3>Existing Projects</h3>
                <ul>
                    {projects.map(p => (
                        <li key={p._id}>
                            <strong>{p.title}</strong> - {p.assignedUsers?.length} users
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default AdminDashboard;
