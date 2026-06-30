import { useState, useEffect } from "react";
import { StickyNote, Save, Clock, Loader2 } from "lucide-react";

interface PrivateNotesProps {
  candidateId: string;
}

export default function PrivateNotes({ candidateId }: PrivateNotesProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (candidateId) {
      setIsLoading(true);
      fetch(`/api/v1/notes/${candidateId}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setNotes(data);
        })
        .catch(e => console.error("Failed to fetch notes", e))
        .finally(() => setIsLoading(false));
    }
  }, [candidateId]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/v1/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          candidateId,
          content: newNote
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setNotes([data.note, ...notes]);
        setNewNote("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-sm mt-4">
      <h4 className="font-bold text-amber-900 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
        <StickyNote className="w-4 h-4 text-amber-600" />
        Private Notes
      </h4>
      
      <div className="space-y-4">
        <div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a private note about this candidate..."
            className="w-full min-h-[100px] p-3 text-sm text-gray-800 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveNote}
              disabled={!newNote.trim() || isSaving}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-2">
            {notes.map(note => (
              <div key={note.id} className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm relative group">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-medium">
                  <Clock className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {notes.length === 0 && !isLoading && (
              <div className="text-sm text-gray-400 text-center py-4 italic">
                No private notes yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
