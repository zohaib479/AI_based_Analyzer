import { useState } from "react";
import "./Register.css"; // Import CSS file
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Components/Firebase";
import { Navigate, useNavigate } from "react-router";
const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
    const navigate=useNavigate()
    const navigatetologin=()=>{
        navigate('/login')
    }
    const navigatetohome=()=>{
        navigate('/home')
    }
  const handleRegister =async (e) => {
  e.preventDefault();
  try{
    await createUserWithEmailAndPassword(auth,email,password)
    const user=auth.currentUser
    console.log(user);
    console.log("User Registered Successzfully");
    navigate('/login')
  }catch(err){
    console.log(err);
    
  }
  };

  return (
    <form action="" onSubmit={handleRegister}>
    <div className="register-container">
      <div className="register-box">
        <h2>Sign Up</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            placeholder="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
          />
        </div>
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
        <button className="register-btn" onClick={handleRegister}>
          Register
        </button>
        <button className="skip-btn" onClick={navigatetohome}>
          Skip Login
        </button>
        <p className="login-text">
          Already have an account? <span onClick={navigatetologin}>Login here</span>
        </p>
      </div>
    </div>
    </form>
  );
};

export default Register;
