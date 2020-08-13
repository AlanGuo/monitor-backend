export function jsonResponse({data, code, msg}: {data?: any, code?: number, msg?: string} = {}) {
  return {
    code: code || 0,
    data: data ? data:undefined,
    msg: msg || ""
  }
}
