import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [commentText, setCommentText] = useState({}); // Map taskId -> text

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/tasks', config);
            setTasks(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch tasks');
        }
    };

    const updateStatus = async (taskId, getStatus) => {
        try {
            await axios.put(`http://localhost:5001/api/tasks/${taskId}/status`, { status: getStatus }, config);
            toast.success('Status updated');
            fetchTasks(); // Refresh
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating status');
        }
    };

    const addComment = async (taskId) => {
        try {
            await axios.post(`http://localhost:5001/api/tasks/${taskId}/comment`, { text: commentText[taskId] }, config);
            toast.success('Comment added');
            setCommentText(prev => ({ ...prev, [taskId]: '' }));
            fetchTasks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding comment');
        }
    };

    return (
        <div className="dashboard-container">
            <header>
                <h1>User Dashboard</h1>
                <p>Welcome, {user?.name}</p>
                <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
            </header>

            <h3>My Tasks</h3>
            <div className="tasks-grid">
                {tasks.length === 0 ? <p>No tasks assigned.</p> : tasks.map(task => (
                    <div key={task._id} className="task-card">
                        <h4>{task.title}</h4>
                        <p>{task.description}</p>
                        <p>Project: <strong>{task.projectId?.title}</strong></p>
                        
                        <div className="status-control">
                            <label>Status: </label>
                            <select 
                                value={task.status} 
                                onChange={(e) => updateStatus(task._id, e.target.value)}
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="comments-section">
                            <h5>Comments</h5>
                            <ul>
                                {task.comments?.length > 0 ? (
                                    task.comments.map((c, i) => (
                                        <li key={i}>{c.text} <small>({new Date(c.createdAt).toLocaleDateString()})</small></li>
                                    ))
                                ) : (
                                    <li><small style={{ color: '#888' }}>No comments yet.</small></li>
                                )}
                            </ul>
                            <div className="add-comment">
                                <input 
                                    type="text" 
                                    placeholder="Add comment..." 
                                    value={commentText[task._id] || ''}
                                    onChange={(e) => setCommentText({...commentText, [task._id]: e.target.value})}
                                />
                                <button onClick={() => addComment(task._id)}>Post</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserDashboard;
