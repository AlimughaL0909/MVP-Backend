const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['description', 'description']
    ]
  },
  timeout: 5000
});

async function fetchRSSFeeds(country, keywords) {
  const query = encodeURIComponent([country, ...keywords].join(' '));
  const googleURL = `https://news.google.com/rss/search?q=${query}`;

  let articles = [];
  
  try {
    const google = await parser.parseURL(googleURL);
    if (google && google.items) {
      articles = [...articles, ...google.items];
    }
  } catch (error) {
    console.error('Error fetching Google News feed:', error.message);
  }

  return articles;
}

function filterArticles(articles, country, keywords) {
  if (!articles || !Array.isArray(articles)) {
    console.warn('No articles to filter');
    return [];
  }

  const seen = new Set();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return articles.filter(a => {
    if (!a || !a.title || !a.pubDate) return false;
    
    const articleDate = new Date(a.pubDate);
    if (articleDate < sevenDaysAgo) return false;

    const text = `${a.title} ${a.contentSnippet || ''}`.toLowerCase();
    const countryMatch = text.includes(country.toLowerCase());
    const keywordMatch = keywords.length === 0 || keywords.some(k => text.includes(k.toLowerCase()));
    
    if ((countryMatch || keywordMatch) && a.link && !seen.has(a.link)) {
      seen.add(a.link);
      return true;
    }
    return false;
  });
}

module.exports = { fetchRSSFeeds, filterArticles };
