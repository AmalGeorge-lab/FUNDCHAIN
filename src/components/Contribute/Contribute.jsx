import { useState } from "react";
import { ethers } from "ethers";
import campaignABI from "../../utils/campaign";

const Contribute = ({ address, minimum , setContribute , fetchCampaigns }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const contribute = async (event) => {
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
      const campaignContract = new ethers.Contract(address, campaignABI, signer);

      const tx = await campaignContract.contribute({
        value: ethers.parseEther(amount),
      });

      await tx.wait();

      setSuccess(true);
      setAmount("");
      setContribute(false);
      fetchCampaigns();
    } catch (err) {
      setError(
        err.reason || "Transaction failed or rejected."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Contribute to Campaign
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Support this project to become an approver for spending requests.
          </p>
        </div>
        {address && (
          <span className="text-[11px] font-mono px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        )}
      </div>

      
      {minimum && (
        <div className="mb-5 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Minimum Required Contribution
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {minimum} ETH
          </span>
        </div>
      )}

      
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      
      {success && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Contribution confirmed! You are now a campaign approver.</span>
        </div>
      )}

      
      <form onSubmit={contribute} className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
          >
            Contribution Amount (in ETH)
          </label>
          <div className="relative rounded-xl shadow-sm">
            <input
              type="number"
              step="any"
              min="0"
              id="amount"
              placeholder={`Min ${minimum || "0"} ETH`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
              className="w-full pl-4 pr-16 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all disabled:opacity-50"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-xs font-semibold text-slate-500">ETH</span>
            </div>
          </div>
        </div>

        
        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Processing Contribution...</span>
            </>
          ) : (
            <span>Contribute</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Contribute;