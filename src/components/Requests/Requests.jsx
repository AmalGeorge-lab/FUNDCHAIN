import { useState, useEffect } from "react";
import { ethers } from "ethers";
import campaignABI from "../../utils/campaign";

const Requests = ({ campaignAddress, isManager, userAddress }) => {
  const [requests, setRequests] = useState([]);
  const [approversCount, setApproversCount] = useState(0);
  const [isApprover, setIsApprover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = window.ethereum
        ? new ethers.BrowserProvider(window.ethereum)
        : ethers.getDefaultProvider("sepolia");
      const campaignContract = new ethers.Contract(
        campaignAddress,
        campaignABI,
        provider
      );

      const totalRequests = await campaignContract.getRequestsCount();
      const totalApprovers = await campaignContract.approversCount();
      setApproversCount(Number(totalApprovers));

      let userIsApprover = false;
      if (userAddress) {
        userIsApprover = await campaignContract.approvers(userAddress);
      }
      setIsApprover(userIsApprover);

      const requestCount = Number(totalRequests);
      const requestPromises = [];
      for (let i = 0; i < requestCount; i++) {
        requestPromises.push(campaignContract.requests(i));
      }

      const rawRequests = await Promise.all(requestPromises);
      const formattedRequests = await Promise.all(
        rawRequests.map(async (req, index) => {
          let userHasApproved = false;
          if (userAddress && userIsApprover) {
            try {
              userHasApproved = await campaignContract.hasApproved(
                index,
                userAddress
              );
            } catch (err) {
              setError("Error fetching approval status");
            }
          }
          return {
            id: index,
            description: req[0],
            valueEth: ethers.formatEther(req[1]),
            recipient: req[2],
            complete: req[3],
            approvalCount: Number(req[4]),
            hasApproved: userHasApproved,
          };
        })
      );

      setRequests(formattedRequests);
    } catch (err) {
      setError("Failed to fetch spending requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignAddress) fetchRequests();
  }, [campaignAddress, userAddress]);

  const handleApprove = async (index) => {
    try {
      setActionLoading(index);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const campaignContract = new ethers.Contract(
        campaignAddress,
        campaignABI,
        signer
      );
      const tx = await campaignContract.approveRequest(index);
      await tx.wait();
      await fetchRequests();
    } catch (err) {
      setError(err.reason || "Failed to approve request.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalize = async (index) => {
    try {
      setActionLoading(index);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const campaignContract = new ethers.Contract(
        campaignAddress,
        campaignABI,
        signer
      );
      const tx = await campaignContract.finalizeRequest(index);
      await tx.wait();
      await fetchRequests();
    } catch (err) {
      setError(err.reason || "Failed to finalize request.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <svg
          className="animate-spin h-6 w-6 text-indigo-500"
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
        <span className="text-xs text-slate-400 font-medium">
          Loading spending requests...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
            Spending Requests
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {requests.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Proposals submitted by campaign manager requiring contributor approvals.
          </p>
        </div>
      </div>

      
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

      
      {requests.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <p className="text-xs text-slate-400">
            No spending requests created yet for this campaign.
          </p>
        </div>
      ) : (
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/50">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Approvals</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requests.map((req) => {
                const readyToFinalize =
                  req.approvalCount > approversCount / 2;

                return (
                  <tr
                    key={req.id}
                    className={`transition-colors ${
                      req.complete
                        ? "bg-slate-950/40 opacity-60"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #{req.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                      {req.description}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400 whitespace-nowrap">
                      {req.valueEth} ETH
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {req.recipient.slice(0, 6)}...{req.recipient.slice(-4)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {req.approvalCount} / {approversCount}
                        </span>
                        {readyToFinalize && !req.complete && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                            Ready
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {req.complete ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <span>Finalized</span>
                          <svg
                            className="w-3.5 h-3.5"
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
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          
                          {isApprover && (
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={
                                actionLoading === req.id || req.hasApproved
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                              {actionLoading === req.id
                                ? "Approving..."
                                : req.hasApproved
                                ? "Approved ✓"
                                : "Approve"}
                            </button>
                          )}

                          
                          {isManager && (
                            <button
                              onClick={() => handleFinalize(req.id)}
                              disabled={
                                actionLoading === req.id || !readyToFinalize
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                              {actionLoading === req.id
                                ? "Finalizing..."
                                : "Finalize"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Requests;