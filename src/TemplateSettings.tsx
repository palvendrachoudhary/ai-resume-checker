import React, { useState, useEffect } from "react";
import { X, Save, Settings, Loader2, Mail } from "lucide-react";

interface TemplateSettingsProps {
  onClose: () => void;
}

const DEFAULT_INTERVIEW_TEMPLATE = {
  subject: "Interview Invitation: {{jobTitle}} at Our Company",
  body: "Hi {{candidateName}},\n\nWe were impressed by your background and would like to invite you to interview for the {{jobTitle}} position.\n\nLooking forward to speaking with you!\n\nBest regards,\nThe Hiring Team"
};

const DEFAULT_REJECTION_TEMPLATE = {
  subject: "Update on your application for {{jobTitle}}",
  body: "Hi {{candidateName}},\n\nThank you for taking the time to apply for the {{jobTitle}} role. While we were impressed with your experience, we have decided to move forward with other candidates at this time.\n\nWe wish you the best in your job search.\n\nBest regards,\nThe Hiring Team"
};

export default function TemplateSettings({ onClose }: TemplateSettingsProps) {
  const [activeTab, setActiveTab] = useState("interview_scheduling");
  const [templates, setTemplates] = useState<any>({});
  
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/templates")
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(data => {
        const tempMap: any = {};
        if (Array.isArray(data)) {
          data.forEach(t => {
            tempMap[t.type] = t;
          });
        }
        setTemplates(tempMap);
        
        // Initialize current tab
        if (tempMap["interview_scheduling"]) {
          setSubject(tempMap["interview_scheduling"].subject);
          setBody(tempMap["interview_scheduling"].body);
        } else {
          setSubject(DEFAULT_INTERVIEW_TEMPLATE.subject);
          setBody(DEFAULT_INTERVIEW_TEMPLATE.body);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSaveMessage("");
    
    if (templates[tab]) {
      setSubject(templates[tab].subject);
      setBody(templates[tab].body);
    } else {
      if (tab === "interview_scheduling") {
        setSubject(DEFAULT_INTERVIEW_TEMPLATE.subject);
        setBody(DEFAULT_INTERVIEW_TEMPLATE.body);
      } else {
        setSubject(DEFAULT_REJECTION_TEMPLATE.subject);
        setBody(DEFAULT_REJECTION_TEMPLATE.body);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      const res = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          subject,
          body
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTemplates({
          ...templates,
          [activeTab]: data.template
        });
        setSaveMessage("Template saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (e) {
      console.error(e);
      setSaveMessage("Error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setBody(prev => prev + ` {{${placeholder}}}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Email Templates</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center overflow-hidden">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-grow overflow-hidden">
            <div className="w-64 bg-gray-50 border-r border-gray-100 p-4 shrink-0 overflow-y-auto">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Template Types</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleTabChange("interview_scheduling")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "interview_scheduling" 
                      ? "bg-blue-100 text-blue-800" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  Interview Invite
                </button>
                <button
                  onClick={() => handleTabChange("rejection_notice")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "rejection_notice" 
                      ? "bg-blue-100 text-blue-800" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  Rejection Notice
                </button>
              </div>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto flex flex-col">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject Line</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              
              <div className="mb-2 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-gray-500 uppercase">Insert Dynamic Variable:</span>
                <button onClick={() => insertPlaceholder("candidateName")} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors">
                  {`{{candidateName}}`}
                </button>
                <button onClick={() => insertPlaceholder("jobTitle")} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors">
                  {`{{jobTitle}}`}
                </button>
              </div>
              
              <div className="flex-grow mb-4 flex flex-col">
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Body</label>
                <textarea 
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full flex-grow min-h-[250px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-sans resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <span className={`text-sm font-medium ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMessage}
                </span>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !subject.trim() || !body.trim()}
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
