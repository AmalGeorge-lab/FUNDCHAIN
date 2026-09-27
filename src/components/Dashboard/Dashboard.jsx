import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import AuthContext from "../../AuthContext/AuthContext";
import Contribute from "../Contribute/Contribute";
import NewCampaign from "../NewCampaign/NewCampaign";
import AddRequest from "../AddRequest/AddRequest";
import Requests from "../Requests/Requests";
import campaignABI from "../../utils/campaign";
import campaignFactoryABI from "../../utils/factory";
import axios from "axios";






const FundChainLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dbLogoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="dbLogoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <rect x="20" y="32" width="36" height="52" rx="18" stroke="url(#dbLogoGrad1)" strokeWidth="9" transform="rotate(-28 38 58)" />
    <rect x="44" y="16" width="36" height="52" rx="18" stroke="url(#dbLogoGrad2)" strokeWidth="9" transform="rotate(-28 62 42)" />
  </svg>
);

const Dashboard = () => {

  const address = import.meta.env.VITE_ADDRESS;



  const { account, setAccount } = useContext(AuthContext);

  const [currentAddress, setCurrentAddress] = useState(null);
  const [currentMinimum, setCurrentMinimum] = useState(null);
  const [contribute, setContribute] = useState(false);
  const [newCampaign, setNewCampaign] = useState(false);
  const [newRequest, setNewRequest] = useState(false);
  const [requests, setRequests] = useState(false);
  const [manager, setManager] = useState(false);

  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);




  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : ethers.getDefaultProvider("sepolia");
      const factoryContract = new ethers.Contract(address, campaignFactoryABI, provider);
      const campaignAddresses = await factoryContract.getDeployedCampaigns();
      
      const campaignDataPromises = campaignAddresses.map(async (addr) => {
        const campaignContract = new ethers.Contract(addr, campaignABI, provider);
        const summary = await campaignContract.getSummary();
        return {
          address: addr,
          minimumContribution: ethers.formatEther(summary[0]),
          balance: ethers.formatEther(summary[1]),
          requestsCount: summary[2].toString(),
          approversCount: summary[3].toString(),
          manager: summary[4],
        };
      });
      
      const detailedCampaigns = await Promise.all(campaignDataPromises);
      setCampaigns(detailedCampaigns);
    } catch (err) {
      setError("Could not load campaigns from the blockchain. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };




  useEffect(()=>{
    fetchCampaigns();
  },[]);





  const handleWalletDisconnect = async () => {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/logout`,{},{withCredentials: true});
    setAccount(null);
  };




  const formatAddress = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Fetching active campaigns from Sepolia testnet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      
      <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FundChainLogo size={32} />
            <span className="text-lg font-bold tracking-tight text-white">
              Fund<span className="text-indigo-400">Chain</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{formatAddress(account)}</span>
            </div>

            
            <button
              onClick={() => setNewCampaign(true)}
              className="py-2 px-4 rounded-xl text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Campaign</span>
            </button>

            
            <button
              onClick={handleWalletDisconnect}
              className="py-2 px-3 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow">
        
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold">✕</button>
          </div>
        )}

        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Active Campaigns</h1>
            <p className="text-sm text-slate-400">Explore on-chain crowdfunding initiatives or contribute ETH.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            {campaigns.length} Total
          </span>
        </div>

        
        {campaigns.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
              📂
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No Campaigns Found</h3>
            <p className="text-slate-400 text-sm mb-6">Be the first innovator to launch a crowdfunding smart contract.</p>
            <button
              onClick={() => setNewCampaign(true)}
              className="py-2.5 px-5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
            >
              Create First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const isManager = account?.toLowerCase() === campaign.manager.toLowerCase();

              return (
                <div
                  key={campaign.address}
                  className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between group shadow-xl hover:shadow-2xl relative overflow-hidden"
                >
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/50">
                        {formatAddress(campaign.address)}
                      </span>
                      {isManager && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          Manager
                        </span>
                      )}
                    </div>

                    
                    <div className="mb-6">
                      <span className="text-xs text-slate-400 font-medium block mb-1">Campaign Balance</span>
                      <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
                        <span>{campaign.balance}</span>
                        <span className="text-sm font-semibold text-indigo-400">ETH</span>
                      </div>
                    </div>

                    
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 mb-6 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Min Contribution</span>
                        <span className="text-xs font-semibold text-slate-200">{campaign.minimumContribution} ETH</span>
                      </div>
                      <div className="border-x border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Approvers</span>
                        <span className="text-xs font-semibold text-slate-200">{campaign.approversCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Requests</span>
                        <span className="text-xs font-semibold text-slate-200">{campaign.requestsCount}</span>
                      </div>
                    </div>

                    
                    <div className="text-xs text-slate-400 mb-6 flex items-center justify-between">
                      <span className="text-slate-500">Manager:</span>
                      <span className="font-mono text-slate-300">{formatAddress(campaign.manager)}</span>
                    </div>
                  </div>

                  
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setContribute(true);
                        setCurrentAddress(campaign.address);
                        setCurrentMinimum(campaign.minimumContribution);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/10"
                    >
                      Contribute ETH
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setRequests(true);
                          setCurrentAddress(campaign.address);
                          setManager(isManager);
                        }}
                        className="py-2 px-3 rounded-xl font-medium text-xs text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition-all"
                      >
                        Requests ({campaign.requestsCount})
                      </button>

                      {isManager && (
                        <button
                          onClick={() => {
                            setNewRequest(true);
                            setCurrentAddress(campaign.address);
                          }}
                          className="py-2 px-3 rounded-xl font-medium text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                        >
                          + Add Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      
      {(contribute || newCampaign || newRequest || requests) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => {
                setContribute(false);
                setNewCampaign(false);
                setNewRequest(false);
                setRequests(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
            >
              ✕
            </button>

            {contribute && <Contribute address={currentAddress} minimum={currentMinimum} setContribute={setContribute} fetchCampaigns={fetchCampaigns}/>}
            {newCampaign && <NewCampaign setNewCampaign={setNewCampaign} fetchCampaigns={fetchCampaigns}/>}
            {newRequest && <AddRequest campaignAddress={currentAddress} setNewRequest={setNewRequest} fetchCampaigns={fetchCampaigns}/>}
            {requests && <Requests campaignAddress={currentAddress} isManager={manager} userAddress={account}/>}
          </div>
        </div>
      )}

      
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        FundChain &copy; {new Date().getFullYear()} — Decentralized Crowdfunding Ecosystem
      </footer>
    </div>
  );
};

export default Dashboard;