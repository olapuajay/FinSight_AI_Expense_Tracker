import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div>
      Dashboard
      <h1>Welcome, {user?.name || "User"}</h1>
      <button onClick={handleLogout} type="submit">Logout</button>
    </div>
  )
}

export default Dashboard
