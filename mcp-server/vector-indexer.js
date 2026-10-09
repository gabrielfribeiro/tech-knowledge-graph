const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_ROOT = path.resolve(__dirname, '../');
const KB_DIR = path.join(REPO_ROOT, 'knowledge-base');
const GRAPH_FILE = path.join(KB_DIR, 'graph-index.json');
const VECTOR_STORE_FILE = path.join(KB_DIR, 'vector-store.json');

const DIMENSIONS = 256;

// Fast deterministic string hash for feature indexing
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

// Tokenize text into words and subword character n-grams for semantic robustness
function extractFeatures(text) {
  const clean = text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(' ').filter(w => w.length > 1);
  const features = [];

  for (const word of words) {
    features.push(word);
    // Subword n-grams (3-grams and 4-grams) to capture roots, typos, and variations
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        features.push(word.slice(i, i + 3));
      }
    }
  }
  return features;
}

// Create a normalized dense vector using feature hashing (L2 normalized)
function createLocalEmbedding(text, weights = {}) {
  const vector = new Float32Array(DIMENSIONS);
  const features = extractFeatures(text);

  for (const feat of features) {
    const idx = hashString(feat) % DIMENSIONS;
    // Positive or negative random-like projection based on second hash bit
    const sign = (hashString(feat + '_sign') % 2 === 0) ? 1 : -1;
    vector[idx] += sign;
  }

  // L2 normalization for accurate cosine similarity
  let norm = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

// Calculate Cosine Similarity between two normalized vectors
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

function parseFrontmatter(content) {
  content = content.replace(/^\uFEFF/, '').trimStart();
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: {}, body: content };
  const rawYaml = match[1];
  const body = content.slice(match[0].length).trim();
  const data = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(trimmed.slice(2).replace(/^['"]|['"]$/g, ''));
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      currentKey = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (val === '') {
        data[currentKey] = [];
      } else if (val.startsWith('[') && val.endsWith(']')) {
        data[currentKey] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        data[currentKey] = val.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return { frontmatter: data, body };
}

// OpenAI Embedding caller (if OPENAI_API_KEY is configured)
async function getOpenAIEmbedding(text, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      input: text.slice(0, 8000),
      model: 'text-embedding-3-small'
    });

    const req = https.request('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.data && parsed.data[0]) {
            resolve(parsed.data[0].embedding);
          } else {
            reject(new Error(parsed.error ? parsed.error.message : 'Falha ao gerar embedding na OpenAI'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function indexKnowledgeBase() {
  console.log('🔄 Iniciando indexação e vetorização da base de conhecimento...');

  if (!fs.existsSync(GRAPH_FILE)) {
    console.error('graph-index.json não encontrado. Execute npm run compile primeiro.');
    return;
  }

  const graph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8').replace(/^\uFEFF/, ''));
  const nodes = graph.nodes || {};
  const documents = [];
  const apiKey = process.env.OPENAI_API_KEY || null;

  for (const [id, meta] of Object.entries(nodes)) {
    const fullPath = path.join(REPO_ROOT, meta.path);
    if (!fs.existsSync(fullPath)) continue;

    const rawContent = fs.readFileSync(fullPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(rawContent);

    // Build rich textual representation for vectorization with semantic weighting
    const titleWeight = `${meta.title} `.repeat(3);
    const tagsWeight = `${(meta.tags || []).join(' ')} `.repeat(2);
    const contextText = `${titleWeight} ${meta.type} ${tagsWeight} ${body}`;

    let vector;
    if (apiKey) {
      try {
        vector = await getOpenAIEmbedding(contextText, apiKey);
      } catch (e) {
        console.warn(`Aviso: Falha ao chamar OpenAI para ${id}, usando vetorizador local. Erro: ${e.message}`);
        vector = createLocalEmbedding(contextText);
      }
    } else {
      vector = createLocalEmbedding(contextText);
    }

    documents.push({
      id: meta.id,
      type: meta.type,
      title: meta.title,
      path: meta.path,
      tags: meta.tags || [],
      metadata: meta.metadata || {},
      snippet: body.slice(0, 300).replace(/\r?\n/g, ' ') + '...',
      vector
    });
  }

  const vectorStore = {
    metadata: {
      engine: apiKey ? 'openai-text-embedding-3-small' : 'local-semantic-hashing-v1',
      dimensions: documents[0] ? documents[0].vector.length : DIMENSIONS,
      total_documents: documents.length,
      indexed_at: new Date().toISOString()
    },
    documents
  };

  fs.writeFileSync(VECTOR_STORE_FILE, JSON.stringify(vectorStore, null, 2), 'utf8');
  console.log(`✅ Vetorização concluída! ${documents.length} documentos indexados em: knowledge-base/vector-store.json`);
  return vectorStore;
}

function loadVectorStore() {
  if (!fs.existsSync(VECTOR_STORE_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(VECTOR_STORE_FILE, 'utf8').replace(/^\uFEFF/, ''));
}

async function searchVectorStore(query, topK = 5) {
  let store = loadVectorStore();
  if (!store || !store.documents || store.documents.length === 0) {
    store = await indexKnowledgeBase();
  }

  if (!store || !store.documents) {
    return [];
  }

  const apiKey = process.env.OPENAI_API_KEY || null;
  let queryVector;

  if (store.metadata.engine.includes('openai') && apiKey) {
    try {
      queryVector = await getOpenAIEmbedding(query, apiKey);
    } catch (_) {
      queryVector = createLocalEmbedding(query);
    }
  } else {
    queryVector = createLocalEmbedding(query);
  }

  const scoredDocs = store.documents.map(doc => {
    const score = cosineSimilarity(queryVector, doc.vector);
    return {
      id: doc.id,
      type: doc.type,
      title: doc.title,
      path: doc.path,
      tags: doc.tags,
      metadata: doc.metadata,
      snippet: doc.snippet,
      similarity_score: Math.round(score * 1000) / 1000
    };
  });

  scoredDocs.sort((a, b) => b.similarity_score - a.similarity_score);
  return scoredDocs.slice(0, topK);
}

module.exports = {
  indexKnowledgeBase,
  loadVectorStore,
  searchVectorStore,
  createLocalEmbedding,
  cosineSimilarity
};

if (require.main === module) {
  indexKnowledgeBase().then(() => {
    console.log('\n🔍 Testando busca vetorial com query "falha cobranca webhook":');
    return searchVectorStore('falha cobranca webhook', 3);
  }).then(results => {
    console.log(JSON.stringify(results, null, 2));
  }).catch(err => {
    console.error('Erro:', err);
  });
}
