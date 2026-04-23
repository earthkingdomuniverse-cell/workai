import { OpenAI } from 'openai';
import * as fs from 'fs';
import { execSync } from 'child_process';

async function main() {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.log('⚠️ OPENAI_API_KEY not found. Skipping AI Review.');
    return;
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  // Get the diff of the PR
  const diff = execSync('git diff origin/main...HEAD').toString();

  if (!diff) {
    console.log('No changes found.');
    return;
  }

  console.log('🤖 AI is reviewing the changes...');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // or gpt-3.5-turbo
    messages: [
      {
        role: 'system',
        content: `You are an expert senior software engineer and security researcher. 
        Review the following git diff for a Fastify/TypeScript backend and Expo mobile project.
        Provide:
        1. A brief summary of changes.
        2. Potential bugs or security issues.
        3. Performance or clean code suggestions.
        Keep it concise and professional.`,
      },
      {
        role: 'user',
        content: `Here is the diff:\n\n${diff}`,
      },
    ],
  });

  const review = response.choices[0].message.content;

  // Save to a file for the GitHub Action to read
  fs.writeFileSync('ai-review.md', review || 'No feedback provided.');
  console.log('✅ AI Review completed.');
}

main().catch((err) => {
  console.error('❌ AI Review failed:', err);
  process.exit(1);
});
