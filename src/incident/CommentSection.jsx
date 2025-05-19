import React, { useState } from "react";
import { updateData } from "../../services/updatedata";
import { Loader, Send } from "lucide-react";

const CommentSection = ({ incidentId, comments = [], onCommentAdded }) => {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fullName = localStorage.getItem("fullName") || "Anonymous";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      const comment = {
        user: fullName,
        comment: newComment.trim(),
        time: new Date().toISOString()
      };
      
      const updatedComments = [...comments, comment];
      
      await updateData(`https://patient-care-server.onrender.com/api/v1/incidents/${incidentId}`, {
        comments: updatedComments
      });
      
      setNewComment("");
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError("Failed to add comment. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {comments.length === 0 ? (
        <p className="text-gray-500 italic">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{comment.user}</h4>
                <span className="text-sm text-gray-500">{formatDate(comment.time)}</span>
              </div>
              <p className="text-gray-700">{comment.comment}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        {error && (
          <div className="text-red-500 text-sm mb-2">
            {error}
          </div>
        )}
        
        <div className="text-gray-950 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;