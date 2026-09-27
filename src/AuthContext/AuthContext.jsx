import { createContext, useState , useEffect } from "react";
export const AuthContext = createContext();
import axios from "axios";




export const AuthProvider = ({children}) => {


  const [account, setAccount] = useState(null);
  const [loading , setLoading] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/auth`,{withCredentials: true,});
        const data = res.data;
        setAccount(data.user);
      } catch (error) {
        setAccount(null);
      } finally {
        setLoading(false);
      }
    };
    checkExistingSession();
  }, []);


  return (
    <AuthContext.Provider value={{ account , setAccount , loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext;