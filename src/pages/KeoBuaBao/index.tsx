import React, { useState } from "react";
import { Card, Button, Space, Typography, List } from "antd";

const { Title, Text } = Typography;

type Choice = "keo" | "bua" | "bao";

interface GameHistory {
  player: Choice;
  computer: Choice;
  result: string;
}

const choices: Choice[] = ["keo", "bua", "bao"];

const getComputerChoice = (): Choice => {
  const index = Math.floor(Math.random() * 3);
  return choices[index];
};

const getResult = (player: Choice, computer: Choice): string => {
  if (player === computer) return "Hòa";

  if (
    (player === "keo" && computer === "bao") ||
    (player === "bua" && computer === "keo") ||
    (player === "bao" && computer === "bua")
  ) {
    return "Bạn thắng";
  }

  return "Bạn thua";
};

const RockPaperScissors: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [history, setHistory] = useState<GameHistory[]>([]);

  const playGame = (playerChoice: Choice) => {
    const computerChoice = getComputerChoice();
    const gameResult = getResult(playerChoice, computerChoice);

    setResult(
      `Bạn: ${playerChoice} | Máy: ${computerChoice} → ${gameResult}`
    );

    const newHistory: GameHistory = {
      player: playerChoice,
      computer: computerChoice,
      result: gameResult,
    };

    setHistory([newHistory, ...history]);
  };

  return (
    <Card style={{ maxWidth: 600, margin: "auto" }}>
      <Title level={3}>Game Oẳn Tù Tì</Title>

      <Space style={{ marginBottom: 20 }}>
        <Button onClick={() => playGame("keo")}>✌️ Kéo</Button>
        <Button onClick={() => playGame("bua")}>✊ Búa</Button>
        <Button onClick={() => playGame("bao")}>✋ Bao</Button>
      </Space>

      <div style={{ marginBottom: 20 }}>
        <Text strong>{result}</Text>
      </div>

      <Title level={4}>Lịch sử trận đấu</Title>

      <List
        bordered
        dataSource={history}
        renderItem={(item) => (
          <List.Item>
            
            Bạn: {item.player} | Máy: {item.computer} → {item.result}
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RockPaperScissors;