export function getTodayTime (time?: number) {
  const tmp = time ?? Date.now();
  return Math.floor(tmp / 86400000) * 86400000
}

export function getTodayInterval(time?: number) {
  const tmp = time ?? Date.now();
  return {startTime: Math.floor(tmp / 86400000) * 86400000, endTime: Math.ceil(tmp / 86400000) * 86400000}
}