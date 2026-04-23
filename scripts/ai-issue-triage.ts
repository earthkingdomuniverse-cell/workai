import { OpenAI } from 'openai';
import * as fs from 'fs';

async function main() {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.log('⚠️ OPENAI_API_KEY not found. Skipping AI Triage.');
    return;
  }

  const issueTitle = process.env.ISSUE_TITLE || '';
  const issueBody = process.env.ISSUE_BODY || '';

  if (!issueTitle && !issueBody) {
    console.log('No issue content found.');
    return;
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  console.log('🤖 AI is triaging the issue...');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an AI issue triage assistant for a Fastify/TypeScript backend project.
        Based on the title and body of the issue, suggest up to 3 relevant labels from the following list:
        - bug
        - enhancement
        - question
        - documentation
        - backend
        - mobile
        - security
        - good first issue

        Respond ONLY with a comma-separated list of the suggested labels. If none fit, respond with "needs-triage".`,
      },
      {
        role: 'user',
        content: `Title: ${issueTitle}\n\nBody: ${issueBody}`,
      },
    ],
  });

  const rawLabels = response.choices[0].message.content || 'needs-triage';
  const labels = rawLabels.split(',').map(l => l.trim().toLowerCase());
  
  // Save to a file for the GitHub Action to read
  fs.writeFileSync('ai-labels.txt', labels.join(','));
  console.log(`✅ AI Triage completed. Suggested labels: ${labels.join(', ')}`);
}

main().catch((err) => {
  console.error('❌ AI Triage failed:', err);
  process.exit(1);
});
