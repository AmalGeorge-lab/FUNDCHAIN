import { useState } from "react";
import { ethers } from "ethers";
import campaignFactoryABI from "../../utils/factory";

const address = import.meta.env.VITE_ADDRESS;

const NewCampaign = ({ setNewCampaign , fetchCampaigns }) => {
  const [minimumContribution, setMinimumContribution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createCampaign = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);

      if (!window.ethereum) {
        setError("MetaMask wallet is not detected. Please install the extension.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factoryContract = new ethers.Contract(address, campaignFactoryABI, signer);

      const minimumWei = ethers.parseEther(minimumContribution);
      const tx = await factoryContract.createCampaign(minimumWei);
      
      await tx.wait();
      
      setSuccess(true);
      setMinimumContribution("");
      setNewCampaign(false);
      fetchCampaigns();
    } catch (err) {
      setError(
        "Transaction rejected or failed during deployment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Create New Campaign</h2>
        <p className="text-xs text-slate-400 mt-1">
          Deploy a new smart contract to collect ETH contributions with custom threshold rules.
        </p>
      </div>

      
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Campaign contract deployed successfully on Sepolia! Refresh to view.</span>
        </div>
      )}

      
      <form onSubmit={createCampaign} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Minimum Contribution
          </label>
          <div className="relative rounded-xl shadow-sm">
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 0.01"
              value={minimumContribution}
              onChange={(e) => setMinimumContribution(e.target.value)}
              required
              disabled={loading}
              className="w-full pl-4 pr-16 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all disabled:opacity-50"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-xs font-semibold text-slate-500">ETH</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Contributors must send at least this amount to become eligible approvers.
          </p>
        </div>

        
        <button
          type="submit"
          disabled={loading || !minimumContribution}
          className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Deploying Contract...</span>
            </>
          ) : (
            <span>Create Campaign</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewCampaign;