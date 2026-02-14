import { useState, useEffect } from 'react';
import './App.css';
import { topics, flashcards, quizQuestions } from './data';

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, topic, flashcards, browse, quiz, progress
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('medieval-india-progress');
    if (saved) {
      setKnownCards(JSON.parse(saved));
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (topicId, cardId, known) => {
    const updated = { ...knownCards, [`${topicId}-${cardId}`]: known };
    setKnownCards(updated);
    localStorage.setItem('medieval-india-progress', JSON.stringify(updated));
  };

  const selectTopic = (topic) => {
    setSelectedTopic(topic);
    setCurrentView('topic');
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore({ correct: 0, total: 0 });
  };

  const startMode = (mode) => {
    setCurrentView(mode);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore({ correct: 0, total: 0 });
  };

  const cards = selectedTopic ? flashcards[selectedTopic.id] : [];
  const questions = selectedTopic ? quizQuestions[selectedTopic.id] : [];

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    setCurrentCardIndex((currentCardIndex + 1) % cards.length);
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    setCurrentCardIndex((currentCardIndex - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const handleKnown = (known) => {
    saveProgress(selectedTopic.id, cards[currentCardIndex].id, known);
    handleNext();
  };

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    const correct = index === questions[currentQuestionIndex].correct;
    setQuizScore({
      correct: quizScore.correct + (correct ? 1 : 0),
      total: quizScore.total + 1
    });
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((currentQuestionIndex + 1) % questions.length);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((currentQuestionIndex - 1 + questions.length) % questions.length);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const getProgressStats = () => {
    if (!selectedTopic) return { known: 0, unknown: 0, total: 0 };
    const topicCards = flashcards[selectedTopic.id];
    const known = topicCards.filter(card => 
      knownCards[`${selectedTopic.id}-${card.id}`] === true
    ).length;
    const unknown = topicCards.filter(card => 
      knownCards[`${selectedTopic.id}-${card.id}`] === false
    ).length;
    return { known, unknown, total: topicCards.length };
  };

  // HOME VIEW
  if (currentView === 'home') {
    return (
      <div className="app">
        <div className="home-container">
          <div className="home-header">
            <h1 className="app-title">🏰 Medieval India</h1>
            <p className="app-subtitle">UPSC Preparation - Interactive Learning</p>
          </div>
          
          <div className="topics-grid">
            {topics.map(topic => {
              const topicCards = flashcards[topic.id];
              const known = topicCards.filter(card => 
                knownCards[`${topic.id}-${card.id}`] === true
              ).length;
              const progress = Math.round((known / topicCards.length) * 100);

              return (
                <div 
                  key={topic.id} 
                  className="topic-card"
                  onClick={() => selectTopic(topic)}
                  style={{ borderLeft: `4px solid ${topic.color}` }}
                >
                  <div className="topic-emoji">{topic.emoji}</div>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                  <div className="topic-stats">
                    <span>{topicCards.length} flashcards</span>
                    <span>{quizQuestions[topic.id].length} questions</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%`, backgroundColor: topic.color }}
                    />
                  </div>
                  <span className="progress-text">{progress}% mastered</span>
                </div>
              );
            })}
          </div>

          <footer className="footer">
            <p>Medieval India UPSC Prep • {topics.length} Topic • {topics.reduce((sum, t) => sum + flashcards[t.id].length, 0)} Flashcards</p>
          </footer>
        </div>
      </div>
    );
  }

  // TOPIC SELECTION VIEW
  if (currentView === 'topic') {
    return (
      <div className="app">
        <div className="topic-view">
          <button className="back-btn" onClick={() => setCurrentView('home')}>
            ← Back to Topics
          </button>
          
          <div className="topic-header" style={{ borderBottom: `3px solid ${selectedTopic.color}` }}>
            <h1>{selectedTopic.emoji} {selectedTopic.title}</h1>
            <p>{selectedTopic.description}</p>
          </div>

          <div className="mode-grid">
            <div className="mode-card" onClick={() => startMode('flashcards')}>
              <div className="mode-icon">🎴</div>
              <h3>Flashcards</h3>
              <p>Learn with interactive flashcards</p>
              <span className="mode-count">{cards.length} cards</span>
            </div>

            <div className="mode-card" onClick={() => startMode('browse')}>
              <div className="mode-icon">📖</div>
              <h3>Browse All</h3>
              <p>View all content at once</p>
              <span className="mode-count">{cards.length} cards</span>
            </div>

            <div className="mode-card" onClick={() => startMode('quiz')}>
              <div className="mode-icon">✍️</div>
              <h3>Quiz</h3>
              <p>Test your knowledge</p>
              <span className="mode-count">{questions.length} questions</span>
            </div>

            <div className="mode-card" onClick={() => startMode('progress')}>
              <div className="mode-icon">📊</div>
              <h3>Progress</h3>
              <p>Track your learning</p>
              <span className="mode-count">Stats & insights</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FLASHCARDS VIEW
  if (currentView === 'flashcards') {
    const card = cards[currentCardIndex];
    return (
      <div className="app">
        <div className="flashcard-container">
          <button className="back-btn" onClick={() => setCurrentView('topic')}>
            ← Back to {selectedTopic.title}
          </button>

          <div className="flashcard-header">
            <h2>{selectedTopic.emoji} {selectedTopic.title}</h2>
            <p>Card {currentCardIndex + 1} of {cards.length}</p>
          </div>

          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <p>{card.front}</p>
                <span className="flip-hint">Click to flip</span>
              </div>
              <div className="flashcard-back">
                <p style={{ whiteSpace: 'pre-line' }}>{card.back}</p>
                <span className="flip-hint">Click to flip back</span>
              </div>
            </div>
          </div>

          <div className="flashcard-actions">
            <button onClick={() => handleKnown(false)} className="btn-unknown">
              ❌ Don't Know
            </button>
            <button onClick={() => handleKnown(true)} className="btn-known">
              ✓ Know It
            </button>
          </div>

          <div className="flashcard-nav">
            <button onClick={handlePrevious}>
              ← Previous
            </button>
            <button onClick={handleNext}>
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // BROWSE VIEW
  if (currentView === 'browse') {
    return (
      <div className="app">
        <div className="browse-container">
          <button className="back-btn" onClick={() => setCurrentView('topic')}>
            ← Back to {selectedTopic.title}
          </button>

          <div className="browse-header">
            <h2>{selectedTopic.emoji} {selectedTopic.title} - All Cards</h2>
            <p>{cards.length} flashcards</p>
          </div>

          <div className="browse-grid">
            {cards.map((card, index) => (
              <div key={card.id} className="browse-card">
                <div className="browse-card-number">#{index + 1}</div>
                <h3>{card.front}</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{card.back}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  if (currentView === 'quiz') {
    const question = questions[currentQuestionIndex];
    return (
      <div className="app">
        <div className="quiz-container">
          <button className="back-btn" onClick={() => setCurrentView('topic')}>
            ← Back to {selectedTopic.title}
          </button>

          <div className="quiz-header">
            <h2>{selectedTopic.emoji} {selectedTopic.title} Quiz</h2>
            <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
            <div className="quiz-score">
              Score: {quizScore.correct}/{quizScore.total} 
              {quizScore.total > 0 && ` (${Math.round((quizScore.correct/quizScore.total)*100)}%)`}
            </div>
          </div>

          <div className="quiz-question">
            <h3 style={{ whiteSpace: 'pre-line' }}>{question.question}</h3>
            <div className="quiz-options">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-option ${
                    selectedAnswer === index
                      ? index === question.correct
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  } ${
                    showExplanation && index === question.correct ? 'correct' : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="quiz-explanation">
                <h4>Explanation:</h4>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>

          <div className="quiz-nav">
            <button onClick={handlePreviousQuestion}>
              ← Previous
            </button>
            <button onClick={handleNextQuestion}>
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PROGRESS VIEW
  if (currentView === 'progress') {
    const stats = getProgressStats();
    const percentage = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0;

    return (
      <div className="app">
        <div className="progress-container">
          <button className="back-btn" onClick={() => setCurrentView('topic')}>
            ← Back to {selectedTopic.title}
          </button>

          <div className="progress-header">
            <h2>{selectedTopic.emoji} {selectedTopic.title} Progress</h2>
          </div>

          <div className="progress-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.known}</div>
              <div className="stat-label">Cards Mastered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.unknown}</div>
              <div className="stat-label">Cards Learning</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Cards</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{percentage}%</div>
              <div className="stat-label">Completion</div>
            </div>
          </div>

          <div className="progress-visual">
            <h3>Your Progress</h3>
            <div className="progress-bar-large">
              <div 
                className="progress-fill" 
                style={{ width: `${percentage}%`, backgroundColor: selectedTopic.color }}
              />
            </div>
          </div>

          <div className="progress-actions">
            <button onClick={() => startMode('flashcards')} className="action-btn">
              Continue Learning
            </button>
            <button onClick={() => startMode('quiz')} className="action-btn">
              Take Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
