import { v4 } from "uuid";

export const generatedId = (): string => {
  return v4();
}; 