import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/questions'); // Update this
      //console.log("Fetched Questions: ", res.data);
      setQuestions(res.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handlePostQuestion = async () => {
    try {
      const res = await axios.post('http://localhost:5000/questions', { name, question }); // Update this
      setQuestions([res.data, ...questions]);
      setQuestion('');
      fetchQuestions();
    } catch (error) {
      console.error('Error posting question:', error);
    }
  };

  const handleComment = async (id, commentText) => {
    try {
      const res = await axios.post(`http://localhost:5000/questions/${id}/comments`, { name, text: commentText }); // Update this
      console.log("Comment Added: ", res.data);
      setQuestions(questions.map(q => q._id === id ? res.data : q));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditQuestion = async (id) => {
    const newQuestion = prompt("Edit your question:");
    if (newQuestion) {
      try {
        const res = await axios.put(`http://localhost:5000/questions/${id}`, { question: newQuestion }); // Update this
        setQuestions(questions.map(q => (q._id === id ? res.data : q)));
        fetchQuestions();
      } catch (error) {
        console.error('Error editing question:', error);
      }
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/questions/${id}`); // Update this
      setQuestions(questions.filter(q => q._id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div className="container">
      <h1 className="text-center my-4">Question & Answer Forum</h1>
      <div className="card mb-4 p-4 shadow-sm">
        <h5>Ask a Question</h5>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Ask a question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handlePostQuestion}>
          Post Question
        </button>
      </div>

      <div className="questions-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {questions.map((q) => (
          <div className="card mb-3 shadow-sm" key={q._id}>
            <div className="card-body">
              <h5 className="card-title">{q.question}</h5>
              <p className="card-text">By {q.name} on {new Date(q.createdAt).toLocaleString()}</p>
              <button className="btn btn-sm btn-warning" onClick={() => handleEditQuestion(q._id)}>
                Edit
              </button>
              <button className="btn btn-sm btn-danger ml-2" onClick={() => handleDeleteQuestion(q._id)}>
                Delete
              </button>

              <div className="comments-section mt-3">
                <h6>Comments</h6>
                {q.comments.map((c, idx) => (
                  <p key={idx}><strong>{c.name}:</strong> {c.text}</p>
                ))}
                <CommentInput onComment={(text) => handleComment(q._id, text)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const CommentInput = ({ onComment }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = () => {
    onComment(commentText);
    setCommentText('');
  };

  return (
    <div className="input-group mt-2">
      <input
        type="text"
        className="form-control"
        placeholder="Add a comment"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <div className="input-group-append">
        <button className="btn btn-outline-primary" onClick={handleSubmit}>
          Comment
        </button>
      </div>
    </div>
  );
};

export default App;
