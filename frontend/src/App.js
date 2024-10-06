import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap'; // Import Bootstrap's modal

function App() {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false); // For the question popup
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [hasEnteredName, setHasEnteredName] = useState(false); // For name input
  const [showOwnQuestions, setShowOwnQuestions] = useState(false); 

  useEffect(() => {
    if (hasEnteredName) {
      fetchQuestions();
    }
  }, [hasEnteredName]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/questions');
      setQuestions(res.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handlePostQuestion = async () => {
    try {
      const res = await axios.post('http://localhost:5000/questions', { name, question });
      setQuestions([res.data, ...questions]); // This ensures the new question is at the top
      setQuestion('');
      setShowQuestionModal(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error posting question:', error);
    }
  };

  const handleToggleQuestions = () => {
    setShowOwnQuestions(!showOwnQuestions);
  };
  const handleComment = async (id, commentText) => {
    try {
      const res = await axios.post(`http://localhost:5000/questions/${id}/comments`, { name, text: commentText });
      // setQuestions(questions.map(q => q._id === id ? res.data : q));
      setQuestions(questions.map(q =>
        q._id === id ? { ...q, comments: res.data.comments } : q
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // const handleEditQuestion = async (id) => {
  //   const newQuestion = prompt("Edit your question:");

  //   if (newQuestion) {
  //     try {
  //       const res = await axios.put(`http://localhost:5000/questions/${id}`, { 
  //         question: newQuestion, 
  //         user: loggedInUser // Send logged-in user's name here
  //       });
  //       setQuestions(questions.map(q => (q._id === id ? res.data : q)));
  //       fetchQuestions(); // You can choose to remove this if the response is handled above
  //     } catch (error) {
  //       console.error('Error editing question:', error);
  //     }
  //   }
  // };
  const handleSubmitEdit = async (id, updatedQuestion) => {
    try {
      const res = await axios.put(`http://localhost:5000/questions/${id}`, {
        question: updatedQuestion,
        user: loggedInUser // Send logged-in user's name here
      });
      setQuestions(questions.map(q => (q._id === id ? res.data : q)));
      setShowEditModal(false); // Close the modal after successful edit
    } catch (error) {
      console.error('Error editing question:', error);
    }
  };
  const handleEditQuestion = (id, currentQuestion) => {
    setEditingQuestion(currentQuestion); // Set the current question text
    setEditingQuestionId(id); // Set the question ID
    setShowEditModal(true); // Show the modal for editing
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/questions/${id}`, {
        data: { user: loggedInUser } // Send logged-in user's name here
      });
      setQuestions(questions.filter(q => q._id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Store user's name in localStorage for later use
  const handleNameSubmit = () => {
    localStorage.setItem('username', name);
    setHasEnteredName(true);
  };

  // If user hasn't entered name, display the name input screen
  if (!hasEnteredName) {
    return (
      <div className="container text-center">
        <h1>Enter Your Name to Continue</h1>
        <input
          type="text"
          className="form-control my-3"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={handleNameSubmit}
          disabled={!name} // Disable the button if no name is entered
        >
          Continue
        </button>
      </div>
    );
  }

  const loggedInUser = localStorage.getItem('username'); // Get the logged-in user's name
  const filteredQuestions = showOwnQuestions
    ? questions.filter(q => q.name === loggedInUser) // Show only user's questions
    : questions;

  return (
    <div className="container">
      <h1 className="text-center my-4">Question & Answer Forum</h1>

      <div className="text-center mb-4">
        <button className="btn btn-secondary" onClick={handleToggleQuestions}>
          {showOwnQuestions ? 'View All Questions' : 'View My Questions'}
        </button>
      </div>
      {/* Button to trigger modal for posting a new question */}
      <button
        className="btn btn-primary mb-4"
        onClick={() => setShowQuestionModal(true)}
      >
        Post a Question
      </button>

      {/* Modal for posting a new question */}
      <Modal show={showQuestionModal} onHide={() => setShowQuestionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Post a Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="input-group mb-3">
            <input
              type="textarea"
              className="form-control"
              placeholder="Ask a question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuestionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePostQuestion} disabled={!question}>
            Submit Question
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Your Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="input-group mb-3">
            <input
              type="textarea"
              className="form-control"
              placeholder="Edit your question"
              value={editingQuestion}
              onChange={(e) => setEditingQuestion(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmitEdit(editingQuestionId, editingQuestion)}
            disabled={!editingQuestion}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="questions-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filteredQuestions.map((q) => (
          <div className="card mb-3 shadow-sm" key={q._id}>
            <div className="card-body">
              <h5 className="card-title">{q.question}</h5>
              <p className="card-text">By {q.name} on {new Date(q.createdAt).toLocaleString()}</p>

              {/* Display "Last updated" time if the question has been edited */}
              {q.createdAt !== q.updatedAt && (
                <p className="card-text text-muted">Last updated at: {new Date(q.updatedAt).toLocaleString()}</p>
              )}

              {/* Only show edit/delete buttons if logged-in user matches the question's author */}
              {loggedInUser === q.name && (
                <>
                  <button className="btn btn-sm btn-warning" onClick={() => handleEditQuestion(q._id)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger ml-2" onClick={() => handleDeleteQuestion(q._id)}>
                    Delete
                  </button>
                </>
              )}

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
