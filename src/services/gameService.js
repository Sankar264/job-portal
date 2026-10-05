import api from "./api";

export async function getScores(userId) {
  const { data } = await api.get("/gameScores", { params: { userId } });
  return data;
}

export const saveScore = (userId, game, score, detail) =>
  api.post("/gameScores", { userId, game, score, detail, playedAt: new Date().toISOString() });