"use client"
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import Confetti from 'react-confetti';

// Generate six random digits (each from 1 to 9)
function generateDigits(count) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 9) + 1);
}

export default function Home() {
  // State
  const [digits] = useState(generateDigits(6));
  const [tokens, setTokens] = useState(digits.map(String));
  const [pendingOp, setPendingOp] = useState(null);
  const [result, setResult] = useState(null);
  const [won, setWon] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Check for unmatched '('
  const hasUnmatchedLeft = () => {
    let count = 0;
    tokens.forEach(token => {
      if (token === '(') count++;
      if (token === ')') count--;
    });
    return count > 0;
  };

  // Validate gap insertion
  const isGapValid = (i, op) => {
    const left = i - 1 >= 0 ? tokens[i - 1] : null;
    const right = i < tokens.length ? tokens[i] : null;
    
    if (['+', '-', '*', '/', '^'].includes(op)) {
      if (!left || !right) return false;
      if ((/^\d+$/.test(left) || left === ')') && (/^\d+$/.test(right) || right === '(')) return true;
      return false;
    } else if (op === '(') {
      if (i === 0 || ['+', '-', '*', '/', '^', '('].includes(left)) {
        if (!right || (/^\d+$/.test(right) || right === '(')) return true;
      }
      return false;
    } else if (op === ')') {
      if (!left || (!(/^\d+$/.test(left) || left === ')'))) return false;
      if (!hasUnmatchedLeft()) return false;
      if (!right || ['+', '-', '*', '/', '^', ')'].includes(right)) return true;
      return false;
    }
    return false;
  };

  // Insert operator
  const insertAtGap = (i) => {
    if (!pendingOp) return;
    const newTokens = [...tokens];
    newTokens.splice(i, 0, pendingOp);
    setTokens(newTokens);
    setPendingOp(null);
    setResult(null);
  };

  // Handle operator button click
  const handleOperatorClick = (op) => {
    setPendingOp(op);
  };

  // Evaluate expression
  const evaluateExpression = () => {
    const expr = tokens.join('');
    try {
      const evalResult = eval(expr);
      setResult(evalResult);
      if (evalResult === 100) {
        setWon(true);
        setShowModal(true);
      } else {
        setWon(false);
      }
    } catch {
      setResult('Invalid Expression');
      setWon(false);
    }
  };

  // Reset game
  const resetGame = () => {
    setTokens(digits.map(String));
    setPendingOp(null);
    setResult(null);
    setWon(false);
    setShowModal(false);
  };

  // Play sound on win
  useEffect(() => {
    if (showModal) {
      const audio = new Audio('/win-sound.mp3');
      audio.play();
    }
  }, [showModal]);

  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', 
        color: '#333'
      }}
    >
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ backgroundColor: '#34495e' }}>
        <div className="container">
          <span className="navbar-brand fw-bold fs-3 text-white">HectoClash</span>
          <span className="navbar-text fs-5 text-light">The Ultimate Mental Math Duel</span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container py-5 flex-grow-1 position-relative">
        {/* Celebration Modal */}
        {showModal && (
          <>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={600}
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <div
                className="p-5 rounded shadow-lg animate__animated animate__bounceInDown text-center"
                style={{
                  backgroundColor: '#fff',
                  color: '#333',
                  maxWidth: '600px',
                  width: '90%',
                }}
              >
                <h2 className="display-3 fw-bold animate__animated animate__heartBeat animate__infinite mb-4">
                  Winner!
                </h2>
                <p className="fs-3 mb-4">
                  Congratulations! You made 100 using the digits in order!
                </p>
                <button onClick={resetGame} className="btn btn-success btn-lg">
                  Play Again
                </button>
              </div>
            </div>
          </>
        )}

        {/* Instructions Card */}
        <div
          className="card mx-auto mb-4 shadow animate__animated animate__fadeInUp"
          style={{
            maxWidth: '600px',
            backgroundColor: '#fff',
            border: 'none',
            color: '#333'
          }}
        >
          <div className="card-body text-center">
            <h4 className="card-title fw-bold mb-3">How to Play</h4>
            <p className="card-text mb-2">
              You are given a sequence of six digits (each from 1 to 9) that must be used in order.
              Insert mathematical operations—addition, subtraction, multiplication, division, exponentiation,
              and parentheses—into the gaps between the digits to form an expression equal to 100.
            </p>
            <p className="fst-italic mb-0">
              Example: 1 + (2+3+4)×(5+6) = 100
            </p>
          </div>
        </div>

        {/* Expression Display */}
        <div className="mb-4 d-flex flex-wrap justify-content-center align-items-center animate__animated animate__fadeIn">
          {Array.from({ length: tokens.length + 1 }).map((_, i) => (
            <React.Fragment key={i}>
              <span
                onClick={() => {
                  if (pendingOp && isGapValid(i, pendingOp)) {
                    insertAtGap(i);
                  }
                }}
                className={`mx-1 p-2 border rounded ${
                  pendingOp && isGapValid(i, pendingOp)
                    ? 'bg-warning text-dark animate__animated animate__flash animate__infinite'
                    : 'bg-white text-dark'
                }`}
                style={{
                  cursor: pendingOp && isGapValid(i, pendingOp) ? 'pointer' : 'default',
                  minWidth: '50px',
                  textAlign: 'center',
                  fontSize: '1.6rem',
                  transition: 'all 0.3s ease',
                }}
              >
                {pendingOp && isGapValid(i, pendingOp) ? pendingOp : ''}
              </span>
              {i < tokens.length && (
                <span
                  className="p-3 border rounded shadow mx-1"
                  style={{
                    backgroundColor: '#fff',
                    color: '#333',
                    fontSize: '2rem',
                    minWidth: '50px',
                    textAlign: 'center',
                  }}
                >
                  {tokens[i]}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Operator Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
          {['+', '-', '*', '/', '^', '(', ')'].map((op) => (
            <button
              key={op}
              className="btn btn-outline-dark btn-lg shadow"
              style={{ minWidth: '60px' }}
              onClick={() => handleOperatorClick(op)}
            >
              {op}
            </button>
          ))}
        </div>

        {/* Evaluation and Control Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-4 mb-4">
          <button
            onClick={evaluateExpression}
            className="btn btn-success btn-lg shadow animate__animated animate__pulse"
          >
            Evaluate
          </button>
          <button
            onClick={resetGame}
            className="btn btn-danger btn-lg shadow"
          >
            Clear
          </button>
        </div>

        {/* Result Alert */}
        {result !== null && !won && (
          <div
            className="alert alert-secondary fs-4 text-center mx-auto animate__animated animate__fadeInUp"
            style={{ maxWidth: '600px' }}
          >
            {result === 'Invalid Expression'
              ? result
              : `Result: ${result}. Keep trying!`}
          </div>
        )}
      </div>
    </div>
  );
}
