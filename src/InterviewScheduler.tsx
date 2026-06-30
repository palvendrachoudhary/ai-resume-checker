import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

interface InterviewSchedulerProps {
  candidateId: string;
}

export default function InterviewScheduler({ candidateId }: InterviewSchedulerProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    if (candidateId) {
      fetch(`/api/v1/interviews/${candidateId}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setInterviews(data);
        })
        .catch(e => console.error("Failed to fetch interviews", e));
    }
  }, [candidateId]);

  const handleSchedule = async () => {
    if (!date || !time) return;
    
    setIsScheduling(true);
    setSuccessMsg("");
    
    try {
      const res = await fetch("/api/v1/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          candidateId,
          date,
          time
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Interview scheduled! Email notification triggered.");
        setInterviews([...interviews, data.interview]);
        setDate("");
        setTime("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
      <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-500" />
        Schedule Interview
      </h4>
      
      <div className="space-y-4">
        {interviews.length > 0 && (
          <div className="mb-4 space-y-2">
            <h5 className="text-xs font-bold text-gray-500 uppercase">Scheduled Interviews</h5>
            {interviews.map(i => (
              <div key={i.id} className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">{i.date} at {i.time}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Time</label>
            <input 
              type="time" 
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button 
          onClick={handleSchedule}
          disabled={!date || !time || isScheduling}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isScheduling ? "Scheduling..." : "Confirm Schedule"}
        </button>
        
        {successMsg && (
          <div className="text-xs text-green-600 font-bold text-center mt-2">
            {successMsg}
          </div>
        )}
      </div>
    </div>
  );
}
