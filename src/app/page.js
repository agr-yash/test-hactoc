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
  // Initially, tokens are simply the six digits as strings.
  const [digits] = useState(generateDigits(6));
  const [tokens, setTokens] = useState(digits.map(String));
  const [pendingOp, setPendingOp] = useState(null); // operator/bracket waiting to be inserted
  const [result, setResult] = useState(null);
  const [won, setWon] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Helper: Check if there is at least one unmatched '(' in the current tokens.
  const hasUnmatchedLeft = () => {
    let count = 0;
    tokens.forEach(token => {
      if (token === '(') count++;
      if (token === ')') count--;
    });
    return count > 0;
  };

  // isGapValid: Checks if inserting op at gap index i (between tokens) is valid.
  const isGapValid = (i, op) => {
    const left = i - 1 >= 0 ? tokens[i - 1] : null;
    const right = i < tokens.length ? tokens[i] : null;
    
    if (['+', '-', '*', '/', '^'].includes(op)) {
      // For binary operators, require a left token that ends with a digit or ')' and a right token that starts with a digit or '('.
      if (!left || !right) return false;
      if ((/^\d+$/.test(left) || left === ')') && (/^\d+$/.test(right) || right === '(')) {
        return true;
      }
      return false;
    } else if (op === '(') {
      // Allow '(' at beginning or after an operator or after another '('.
      // Also, it is valid if the right token exists and is a digit or another '('.
      if (i === 0 || ['+', '-', '*', '/', '^', '('].includes(left)) {
        if (!right || (/^\d+$/.test(right) || right === '(')) {
          return true;
        }
      }
      return false;
    } else if (op === ')') {
      // Allow ')' only if there is an unmatched '('.
      // Also, the left token must be a digit or a ')' and either at the end or followed by an operator.
      if (!left || (!(/^\d+$/.test(left) || left === ')'))) return false;
      if (!hasUnmatchedLeft()) return false;
      if (!right || ['+', '-', '*', '/', '^', ')'].includes(right)) {
        return true;
      }
      return false;
    }
    return false;
  };

  // Insert the pending operator at gap index i.
  const insertAtGap = (i) => {
    if (!pendingOp) return;
    const newTokens = [...tokens];
    newTokens.splice(i, 0, pendingOp);
    setTokens(newTokens);
    setPendingOp(null);
    setResult(null);
  };

  // Called when an operator button is clicked.
  const handleOperatorClick = (op) => {
    setPendingOp(op);
  };

  // Evaluate the expression formed by joining all tokens.
  const evaluateExpression = () => {
    const expr = tokens.join('');
    try {
      // Using eval() for simplicity (be cautious using eval() in production).
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

  // Reset the game.
  const resetGame = () => {
    setTokens(digits.map(String));
    setPendingOp(null);
    setResult(null);
    setWon(false);
    setShowModal(false);
  };

  // Play winning sound when the game is won.
  useEffect(() => {
    if (showModal) {
      const audio = new Audio('/win-sound.mp3');
      audio.play();
    }
  }, [showModal]);

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light position-relative">
      {showModal && (
        <>
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark bg-opacity-75">
            <div className="bg-white p-5 rounded text-center shadow-lg animate__animated animate__bounceInDown">
              <h2 className="display-3 text-success animate__animated animate__heartBeat animate__infinite">
                Winner!
              </h2>
              <p className="fs-3 my-4">Congratulations! You made 100 using the digits in order!</p>
              <button onClick={resetGame} className="btn btn-success btn-lg">
                Play Again
              </button>
            </div>
          </div>
        </>
      )}

      <h1 className="display-4 text-primary mb-3 animate__animated animate__fadeInDown">
        HectoClash - The Ultimate Mental Math Duel
      </h1>
      <div className="mb-4 p-3 border rounded shadow bg-white animate__animated animate__fadeInUp">
        <p className="fs-5 text-center mb-0">
          In this game, you are given a sequence of six digits (each from 1 to 9) which <strong>must be used in the given order</strong>.
          <br />
          Insert mathematical operations (addition, subtraction, multiplication, division, exponentiation, and parentheses)
          in the gaps to form an expression equal to 100.
          <br />
          <em>For example: 1 + (2+3+4)×(5+6) = 100</em>
        </p>
      </div>
      
      {/* Display the expression with clickable gaps */}
      <div className="d-flex align-items-center mb-4">
        {Array.from({ length: tokens.length + 1 }).map((_, i) => (
          <React.Fragment key={i}>
            <span 
              onClick={() => {
                if (pendingOp && isGapValid(i, pendingOp)) {
                  insertAtGap(i);
                }
              }}
              className={`mx-1 p-2 border rounded ${pendingOp && isGapValid(i, pendingOp) ? "bg-info text-white animate__animated animate__pulse" : "bg-light"}`}
              style={{ cursor: pendingOp && isGapValid(i, pendingOp) ? "pointer" : "default", minWidth: "30px", textAlign: "center" }}
            >
              {pendingOp && isGapValid(i, pendingOp) ? pendingOp : ""}
            </span>
            {i < tokens.length && (
              <span className="p-3 bg-white border rounded shadow text-dark display-5">
                {tokens[i]}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Operator Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
        <button className="btn btn-outline-primary" onClick={() => handleOperatorClick('+')}>+</button>
        <button className="btn btn-outline-primary" onClick={() => handleOperatorClick('-')}>-</button>
        <button className="btn btn-outline-primary" onClick={() => handleOperatorClick('*')}>*</button>
        <button className="btn btn-outline-primary" onClick={() => handleOperatorClick('/')}>/</button>
        <button className="btn btn-outline-primary" onClick={() => handleOperatorClick('^')}>^</button>
        <button className="btn btn-outline-primary" onClick={() => handleOperatorClick('(')}>(</button>
        <button className="btn btn-outline-primary" onClick={() => handleOperatorClick(')')}>)</button>
      </div>

      {/* Evaluation and Control Buttons */}
      <div className="d-flex gap-2 mb-3">
        <button onClick={evaluateExpression} className="btn btn-primary btn-lg shadow animate__animated animate__pulse">
          Evaluate
        </button>
        <button onClick={resetGame} className="btn btn-warning btn-lg shadow">
          Clear
        </button>
      </div>
      
      {result !== null && !won && (
        <div className="mt-4 alert alert-info fs-4 animate__animated animate__fadeInUp">
          {result === 'Invalid Expression' ? result : `Result: ${result}. Keep trying!`}
        </div>
      )}
    </div>
  );
}
