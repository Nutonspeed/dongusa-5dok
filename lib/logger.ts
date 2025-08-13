/* eslint-disable no-console */
export const logger = {
  info: (...a: unknown[]) => console.info(...a),
  warn: (...a: unknown[]) => console.warn(...a),
  error: (...a: unknown[]) => console.error(...a),
  group: (...a: unknown[]) => console.group(...a),
  groupEnd: () => console.groupEnd(),
};
