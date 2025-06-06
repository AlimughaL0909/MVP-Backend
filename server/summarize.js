const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeArticles(articles, country, organization) {
  if (!articles || articles.length === 0) {
    return "No relevant articles found to summarize.";
  }

  const content = articles.map(a => `- ${a.title} (${a.link})`).join('\n');
  const prompt = `Analyze and summarize the following news articles about ${organization} in ${country}. 
  Focus on key developments, trends, and important information. Format the summary with clear sections:
  
  Articles:
  ${content}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional news analyst. Provide a well-structured summary with key points, trends, and implications. Use markdown formatting for better readability.' 
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    return res.choices[0].message.content;
  } catch (error) {
    if (error.status === 429) {
      return `Summary of ${articles.length} articles about ${organization} in ${country}:\n\n` +
        articles.map(a => `- ${a.title}`).join('\n') +
        '\n\nNote: Detailed AI summary unavailable due to rate limits. Please try again later.';
    }
    console.error('Error calling OpenAI API:', error.message);
    throw error;
  }
}

module.exports = { summarizeArticles };
