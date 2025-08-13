/* eslint-disable no-console */
export const logger = {
  info: (...a: unknown[]) => console.info(...a),
  warn: (...a: unknown[]) => console.warn(...a),
  error: (...a: unknown[]) => console.error(...a),
  group: (...a: unknown[]) =>
    typeof console.group === "function" ? console.group(...a) : console.log(...a),
  groupEnd: () => {
    if (typeof console.groupEnd === "function") console.groupEnd();
  },
};
