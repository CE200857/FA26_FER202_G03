export const API_URL = 'http://localhost:5001';

export const request = async (path, options = {}) => {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Không kết nối được máy chủ. Hãy chạy "npm run api" rồi thử lại.');
  }

  if (!res.ok) {
    const error = new Error(`Yêu cầu thất bại (${res.status}).`);
    error.status = res.status;
    throw error;
  }

  return res.json();
};
