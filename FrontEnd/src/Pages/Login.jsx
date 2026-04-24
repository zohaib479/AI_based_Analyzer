import { useState } from "react";
import { useNavigate } from "react-router"; // ✅ Import useNavigate
import "./Login.css"; // Import CSS for styling
import { auth } from "../Components/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ Initialize useNavigate

  // Handle Login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      navigate("/home"); // ✅ Use navigate function instead of Navigate component
    } catch (err) {
      console.error(err);
      setError(err.message); // Show Firebase error
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign in</h2>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
      
      </div>
    </div>
  );
};

export default Login;