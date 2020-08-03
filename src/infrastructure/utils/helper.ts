export const jsonResponse = ({data, code, msg}: any = {}) => {
  return {
    code: code || 0,
    data: data ? data : undefined,
    msg: msg || ""
  }
};