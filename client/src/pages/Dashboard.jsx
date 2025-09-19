import Stats from "../components/dashboard/Stats";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";

function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:px-16 px-2 mt-4">
        <h2 className="md:text-2xl text-lg font-bold mb-4">Dashboard</h2>
        <Stats userId={user._id} />
      </div>
    </div>
  )
}

export default Dashboard
