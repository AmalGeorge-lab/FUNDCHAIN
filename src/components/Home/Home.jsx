import { useContext, useState } from "react";
import { ethers } from "ethers";
import AuthContext from "../../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const FundChainLogo = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <rect
      x="20"
      y="32"
      width="36"
      height="52"
      rx="18"
      stroke="url(#logoGrad1)"
      strokeWidth="9"
      transform="rotate(-28 38 58)"
    />
    <rect
      x="44"
      y="16"
      width="36"
      height="52"
      rx="18"
      stroke="url(#logoGrad2)"
      strokeWidth="9"
      transform="rotate(-28 62 42)"
    />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  const { setAccount } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnectAndSign = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install the browser extension to continue.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const nonceRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/nonce`, { address: userAddress },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const nonceData = nonceRes.data;
      if (nonceRes.status !== 200) setError("Failed to fetch sign-in message.");

      const signature = await signer.signMessage(nonceData.message);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/verify`,{address: userAddress,signature: signature},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setAccount(userAddress.toLowerCase());
      navigate("/dashboard");
    } catch (err) {
      if (err.code == 4001) {
        setError("Signature request rejected in MetaMask.");
      } else {
        setError("Failed to authenticate wallet. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      
      <header className="max-w-7xl mx-auto w-full px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <FundChainLogo size={40} />
          <span className="text-xl font-bold tracking-tight text-white">
            Fund<span className="text-indigo-400">Chain</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Sepolia Testnet
        </div>
      </header>

      
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center relative z-10 my-auto">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8">
          <span>🛡️ Decentalized & Transparent Crowdfunding</span>
        </div>

        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Fund ideas directly with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Smart Contract Security
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
          Create campaigns, contribute ETH, and vote on spending requests with full zero-trust on-chain authorization.
        </p>

        
        {error && (
          <div className="w-full max-w-md mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between text-left animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 mb-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-sm text-slate-400 mb-6">Sign in with Ethereum (SIWE) to view and manage campaigns.</p>

          <button
            onClick={handleConnectAndSign}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Awaiting Signature...</span>
              </>
            ) : (
              <>
                <span>Connect MetaMask</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </main>

      
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 relative z-10 border-t border-slate-900">
        FundChain &copy; {new Date().getFullYear()} — Powered by Ethereum Smart Contracts by Amal George
      </footer>
    </div>
  );
};

export default Home;