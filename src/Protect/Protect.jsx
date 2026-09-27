import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../AuthContext/AuthContext";




const Protect = ({children}) => {

  const {account , loading} = useContext(AuthContext);

  if(loading){
    document.title = "Loading";
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Fetching active campaigns from Sepolia testnet...</p>
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/" replace/>;
  }

  return children;
}

export default Protect;