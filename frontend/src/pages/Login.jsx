import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import AuthContext from '../context/AuthContext';
import '../index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const schema = yup.object().shape({
        email: yup.string().email('Invalid email address').required('Email is required'),
        password: yup.string().required('Password is required'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors

        try {
            await schema.validate({ email, password }, { abortEarly: false });
        } catch (validationErrors) {
            const newErrors = {};
            validationErrors.inner.forEach(err => {
                newErrors[err.path] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        const res = await login(email, password);
        if (res.success) {
            toast.success('Login Successful');
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?.role === 'admin') navigate('/admin');
            else navigate('/user');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className={errors.password ? 'input-error' : ''}
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
