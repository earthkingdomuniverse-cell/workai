export interface AiModel {
  id: string;
  name: string;
  generateMatch(input: string): Promise<string>;
}
