import React, { useState } from "react";

const GuessingGame = () => {
  // Sinh số ngẫu nhiên 1-100
  const [targetNumber] = useState(Math.floor(Math.random() * 100) + 1);

  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleGuess = () => {
    if (gameOver) return;

    const numberGuess = Number(guess);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (numberGuess === targetNumber) {
      setMessage("Chúc mừng! Bạn đã đoán đúng!");
      setGameOver(true);
    } else if (numberGuess < targetNumber) {
      setMessage("Bạn đoán quá thấp!");
    } else {
      setMessage("Bạn đoán quá cao!");
    }

    if (newAttempts === 10 && numberGuess !== targetNumber) {
      setMessage("Bạn đã hết lượt! Số đúng là " + targetNumber);
      setGameOver(true);
    }

    setGuess("");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ color: "red" }}>Trò chơi đoán số (1 - 100)</h1>
      <p>Bạn có 10 lượt để đoán.</p>

      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        disabled={gameOver}
      />

      <button onClick={handleGuess} disabled={gameOver} style={{ color: "red" }}>
        Đoán
      </button>

      <p>Lượt đã dùng: {attempts}/10</p>
      <h3>{message}</h3>
    </div>
  );
};

export default GuessingGame;