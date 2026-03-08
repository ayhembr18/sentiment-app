const STOPWORDS_FR = new Set([
  "le","la","les","un","une","des","du","de","et","en","au","aux","à","ce","se","sa","son","ses",
  "mon","ma","mes","ton","ta","tes","je","tu","il","elle","nous","vous","ils","elles","que","qui",
  "quoi","dans","sur","sous","par","pour","avec","ne",
  "tout","tous","cette","cet","ces","ça","c","j","l","d","s","m",
  "n","y","là","où","dont","lorsque","quand","comment","pourquoi","est","sont","était","être",

]);

const STOPWORDS_EN = new Set([
  "the","a","an","and","in","on","at","to","for","of","with","by","from","is","are",
  "was","were","be","been","have","has","had","do","does","did","will","would","could","should",
  "it","its","this","that","i","you","he","she","we","they","me","him","her","us","them","my",
  "your","his","our","their","what","which","who","when","where","why","how",
  "am","im","ive","as","if","then","there","here","up","out","about","than","too",
  
]);

const NEGATIONS = new Set([
  "pas","ne","jamais","aucun","rien","ni","non","sans","peu","guère","nullement","point",
  "not","no","never","neither","nor","without","hardly","barely","scarcely","dont","cant",
  "wont","isnt","arent","wasnt","werent","havent","hasnt","hadnt","wouldnt","couldnt","shouldnt",
  "nothing","nowhere","nobody","none",
]);

// Mots de retournement — indiquent un changement de sentiment
const CONTRAST_WORDS = new Set([
  "mais","pourtant","cependant","toutefois","néanmoins","quand même","malgré","malgre",
  "but","however","although","though","yet","despite","nevertheless","nonetheless","still","even",
]);

// ── LEXIQUE DE SENTIMENT ENRICHI ──────────────────────────────
const SENTIMENT_LEXICON = {
  // ══ TRÈS POSITIFS FR ══
  "excellent": 3, "fantastique": 3, "parfait": 3, "exceptionnel": 3, "magnifique": 3,
  "extraordinaire": 3, "merveilleux": 3, "formidable": 3, "superbe": 3, "impeccable": 3,
  "remarquable": 3, "impressionnant": 3, "incroyable": 3, "splendide": 3, "admirable": 3,
  "phénoménal": 3, "irréprochable": 3, "exquis": 3,

  // ══ POSITIFS FR ══
  "satisfait": 2, "content": 2, "heureux": 2, "ravi": 2, "enchanté": 2, "recommande": 2,
  "qualité": 1, "rapide": 1, "efficace": 1, "pratique": 1, "agréable": 1, "sympa": 1,
  "bon": 1, "bien": 1, "super": 2, "top": 2, "génial": 2, "cool": 1, "pro": 1,
  "conforme": 1, "soigné": 1, "fiable": 2, "durable": 1, "solide": 1, "robuste": 1,
  "fonctionnel": 1, "pratique": 1, "utile": 1, "complet": 1, "précis": 1,
  "élégant": 1, "beau": 1, "joli": 1, "esthétique": 1, "moderne": 1,
  "raisonnable": 1, "abordable": 1, "économique": 1, "avantageux": 1,
  "ponctuel": 1, "rapide": 1, "discret": 1, "propre": 1, "net": 1,

  // ══ MOTS LIÉS AU PRIX / RETOUR FR ══
  "remboursé": 2, "remboursement": 1, "retour": 0, "échange": 0,
  "prix": 0, "tarif": 0, "coût": 0, "gratuit": 1,
  "promotionnel": 1, "promotion": 1, "offre": 1, "réduction": 1,
  "rapport": 0, "valeur": 0,

  // ══ TRÈS NÉGATIFS FR ══
  "catastrophique": -3, "horrible": -3, "terrible": -3, "désastreux": -3, "atroce": -3,
  "arnaque": -3, "escroquerie": -3, "nul": -3, "honteux": -3,
  "scandaleux": -3, "déplorable": -3, "inadmissible": -3, "inacceptable": -2,
  "lamentable": -3, "pitoyable": -3, "abominable": -3, "révoltant": -3,

  // ══ NÉGATIFS FR ══
  "décevant": -2, "déçu": -2, "mauvais": -2, "défectueux": -2, "cassé": -2,
  "lent": -1, "médiocre": -2, "insuffisant": -2, "fragile": -2,
  "inutilisable": -3, "mécontent": -2, "insatisfait": -2, "regrette": -2,
  "inexistant": -2, "absent": -1, "incomplet": -1, "incorrect": -1,
  "abîmé": -2, "endommagé": -2, "brisé": -2, "fendu": -2, "tordu": -2,
  "inutile": -2, "obsolète": -1, "compliqué": -1, "difficile": -1,

  // ══ MOTS LIÉS AU PRIX / RETOUR NÉGATIFS FR ══
  "cher": -1, "coûteux": -2, "onéreux": -2, "exorbitant": -3, "excessif": -2,
  "surfacturé": -3, "surtaxé": -2, "trop cher": -2,
  "non remboursé": -3, "remboursement refusé": -3, "retour impossible": -3,
  "retard": -2, "délai": -1, "délais": -1, "en retard": -2,
  "perdu": -2, "introuvable": -2,

  // ══ TRÈS POSITIFS EN ══
  "excellent": 3, "fantastic": 3, "perfect": 3, "exceptional": 3, "magnificent": 3,
  "outstanding": 3, "wonderful": 3, "superb": 3, "brilliant": 3, "amazing": 3,
  "incredible": 3, "flawless": 3, "spectacular": 3, "extraordinary": 3, "phenomenal": 3,
  "impeccable": 3, "exquisite": 3, "faultless": 3, "sublime": 3,

  // ══ POSITIFS EN ══
  "satisfied": 2, "happy": 2, "pleased": 2, "delighted": 3, "recommend": 2,
  "great": 2, "good": 1, "nice": 1, "fast": 1, "quick": 1, "efficient": 1,
  "reliable": 2, "durable": 1, "quality": 1, "love": 2, "awesome": 2, "best": 2,
  "solid": 1, "sturdy": 1, "robust": 1, "useful": 1, "practical": 1,
  "accurate": 1, "precise": 1, "elegant": 1, "beautiful": 1, "stylish": 1,
  "affordable": 1, "reasonable": 1, "economical": 1, "fair": 1,
  "prompt": 1, "punctual": 1, "smooth": 1, "clean": 1, "clear": 1,
  "refunded": 2, "replacement": 1, "resolved": 2, "fixed": 1,
  "flawlessly": 3, "immaculate": 3, "premium": 2, "early": 1, "delight": 3, "blown away": 3, "blown": 3, "exceeded": 2, "exceed": 2,
  "delight": 2, "delightful": 2, "thrilled": 3, "ecstatic": 3,
  "overwhelmed": 1, "speechless": 2, "gem": 2, "treasure": 2,

  // ══ MOTS LIÉS AU PRIX / RETOUR POSITIFS EN ══
  "worth": 1, "value": 1, "bargain": 2, "deal": 1, "discount": 1, "sale": 0,
  "refund": 0, "return": 0, "exchange": 0, "free": 1,

  // ══ TRÈS NÉGATIFS EN ══
  "terrible": -3, "horrible": -3, "awful": -3, "dreadful": -3, "atrocious": -3,
  "scam": -3, "garbage": -3, "useless": -3, "worthless": -3, "disgusting": -3,
  "catastrophic": -3, "disgraceful": -3, "appalling": -3, "outrageous": -3,
  "abysmal": -3, "despicable": -3, "pathetic": -3, "revolting": -3,

  // ══ NÉGATIFS EN ══
  "disappointed": -2, "disappointing": -2, "bad": -2, "defective": -2, "broken": -2,
  "slow": -1, "mediocre": -2, "cheap": -1, "flimsy": -2,
  "unusable": -3, "unhappy": -2, "unsatisfied": -2, "regret": -2, "waste": -2,
  "poor": -2, "worst": -3, "avoid": -2, "complaint": -1,
  "damaged": -2, "cracked": -2, "torn": -2, "bent": -2, "scratched": -1,
  "missing": -2, "incomplete": -1, "incorrect": -1, "wrong": -1,
  "complicated": -1, "difficult": -1, "confusing": -1, "misleading": -2,
  "failed": -2, "failure": -2, "defects": -2, "broke": -2, "crack": -2,
  "mechanism": 0, "longevity": 0,

  // Mots contextuels neutralisés (apparaissent dans avis positifs : "I was skeptical but...")
  "skeptical": 0, "skeptic": 0, "nervous": 0, "nervou": 0, "concerns": 0, "concerned": 0,
  "expecting": 0, "expected": 0, "initial": 0, "initially": 0,
  "deliberation": 0, "hesitation": 0, "worry": 0, "worried": 0,
  "doubt": 0, "doubts": 0, "unsure": 0, "uncertain": 0,

  // ══ MOTS LIÉS AU PRIX / RETOUR NÉGATIFS EN ══
  "overpriced": -2, "expensive": -2, "costly": -2, "pricey": -1, "outrageous price": -3,
  "overcharged": -3, "rip-off": -3, "ripoff": -3,
  "no refund": -3, "refused refund": -3, "no return": -2, "return refused": -3,
  "delay": -2, "delayed": -2, "late": -1, "never arrived": -3, "lost": -2,

  // ══ SERVICE CLIENT ══
  "réactif": 2, "disponible": 1, "aimable": 1, "professionnel": 2, "compétent": 2,
  "responsive": 2, "helpful": 2, "professional": 2, "courteous": 2, "friendly": 2,
  "incompétent": -2, "impoli": -2, "irrespectueux": -2,
  "unprofessional": -2, "rude": -2, "unhelpful": -2, "useless": -3,
};

const INTENSIFIERS = {
  // FR
  "très": 1.6, "vraiment": 1.5, "absolument": 1.8, "totalement": 1.6, "extrêmement": 1.9,
  "super": 1.4, "tellement": 1.5, "parfaitement": 1.6, "complètement": 1.6,
  "incroyablement": 1.8, "particulièrement": 1.4, "franchement": 1.3,
  "excessivement": 1.7, "énormément": 1.7, "terriblement": 1.7, "affreusement": 1.8,
  "infiniment": 1.8, "profondément": 1.6, "sincèrement": 1.4,
  // EN
  "very": 1.6, "really": 1.5, "absolutely": 1.8, "totally": 1.6, "extremely": 1.9,
  "so": 1.4, "completely": 1.6, "incredibly": 1.8, "quite": 1.3, "pretty": 1.3,
  "especially": 1.4, "highly": 1.5, "deeply": 1.5, "utterly": 1.7, "truly": 1.5,
  "awfully": 1.7, "terribly": 1.7, "dreadfully": 1.8, "ridiculously": 1.6,
  "insanely": 1.7, "outrageously": 1.8,
};

// ── PREPROCESSING ──────────────────────────────────────────────
function normalize(text) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function stem(word) {
  let w = word;
  const fr = ["issement","issant","ements","ement","ations","ation","ment","eux","euse",
               "iques","ique","iste","ité","ants","ant","ents","ent","ers","er","ir","re",
               "ées","ée","es","e","s"];
  for (const s of fr) {
    if (w.length > s.length + 3 && w.endsWith(s)) { w = w.slice(0, -s.length); break; }
  }
  const en = ["ingly","ations","ation","nesses","ness","ments","ment","fully","ful",
               "lessly","less","ings","ing","eds","ed","ers","er","lys","ly","als","al","es","s"];
  for (const s of en) {
    if (w.length > s.length + 3 && w.endsWith(s)) { w = w.slice(0, -s.length); break; }
  }
  return w;
}

function tokenize(text) {
  return normalize(text).split(" ")
    .filter(t => t.length > 1 && !STOPWORDS_FR.has(t) && !STOPWORDS_EN.has(t));
}

function preprocessText(text) {
  const tokens  = tokenize(text).map(stem);
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) bigrams.push(tokens[i] + "_" + tokens[i+1]);
  return [...tokens, ...bigrams];
}

function detectNegation(text) {
  const words = normalize(text).split(" ");
  const negPos = new Set();
  words.forEach((w, i) => {
    if (NEGATIONS.has(w)) {
      for (let j = i+1; j <= Math.min(i+3, words.length-1); j++) negPos.add(j);
    }
  });
  return { hasNeg: negPos.size > 0, negatedWords: new Set([...negPos].map(i => words[i])) };
}

// Détecte les mots de contraste (mais, however...) et leur position
function detectContrast(text) {
  const words = normalize(text).split(" ");
  const positions = [];
  words.forEach((w, i) => { if (CONTRAST_WORDS.has(w)) positions.push(i); });
  return { hasContrast: positions.length > 0, positions };
}

// ── LEXIQUE SCORER ─────────────────────────────────────────────
function lexiconScore(text) {
  const words = normalize(text).split(" ");
  let score = 0, count = 0;
  let intensifier = 1.0;

  // Détecter s'il y a un mot de contraste → donner plus de poids à la 2ème partie
  const contrastInfo = detectContrast(text);

  words.forEach((w, i) => {
    if (INTENSIFIERS[w]) { intensifier = INTENSIFIERS[w]; return; }

    const val = SENTIMENT_LEXICON[w] || SENTIMENT_LEXICON[stem(w)];
    if (val !== undefined) {
      let negated = false;
      for (let j = Math.max(0, i-3); j < i; j++) {
        if (NEGATIONS.has(words[j])) { negated = true; break; }
      }

      // Si mot de contraste détecté, les mots APRÈS ont plus de poids
      let contrastWeight = 1.0;
      if (contrastInfo.hasContrast) {
        const afterContrast = contrastInfo.positions.some(p => i > p);
        contrastWeight = afterContrast ? 1.8 : 0.65;
      }

      const contribution = val * intensifier * (negated ? -0.8 : 1.0) * contrastWeight;
      score += contribution;
      count++;
      intensifier = 1.0;
    }
  });

  const normalized = count > 0 ? score / (Math.sqrt(count) * 3) : 0;
  const clamped    = Math.max(-1, Math.min(1, normalized));

  const pos = Math.max(0, clamped);
  const neg = Math.max(0, -clamped);
  const neu = 1 - pos - neg;
  const sum = pos + neg + Math.max(0.01, neu);

  return {
    1: pos / sum, 0: Math.max(0, neu) / sum, "-1": neg / sum,
    score: clamped, count,
  };
}

// ── TF-IDF ─────────────────────────────────────────────────────
class TFIDF {
  constructor(maxFeatures = 500) {
    this.maxFeatures = maxFeatures;
    this.vocab = {};
    this.idf   = {};
  }

  fit(corpus) {
    const df = {};
    corpus.forEach(doc => { new Set(doc).forEach(t => { df[t] = (df[t] || 0) + 1; }); });
    const N = corpus.length;
    Object.keys(df).forEach(t => { this.idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1; });
    const scored = Object.entries(df)
      .filter(([, f]) => f >= 2 && f <= N * 0.9)
      .map(([t, f]) => [t, this.idf[t] * Math.sqrt(f)])
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.maxFeatures);
    scored.forEach(([t], i) => { this.vocab[t] = i; });
  }

  transform(tokens) {
    const tf  = {};
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    const total = tokens.length || 1;
    const vec   = new Array(Object.keys(this.vocab).length).fill(0);
    Object.entries(tf).forEach(([t, c]) => {
      if (this.vocab[t] !== undefined) {
        vec[this.vocab[t]] = (1 + Math.log(c)) / total * (this.idf[t] || 1);
      }
    });
    const norm = Math.sqrt(vec.reduce((s, v) => s + v*v, 0)) || 1;
    return vec.map(v => v / norm);
  }
}

// ── NAIVE BAYES ────────────────────────────────────────────────
class NaiveBayes {
  constructor(alpha = 0.3) {
    this.alpha = alpha; this.classes = [-1, 0, 1];
    this.logPrior = {}; this.logLikelihood = {}; this.vocabSize = 0;
  }

  fit(X_tokens, y) {
    const cc = {}, tc = {};
    this.classes.forEach(c => { cc[c] = 0; tc[c] = {}; });
    y.forEach((label, i) => {
      cc[label]++;
      X_tokens[i].forEach(t => { tc[label][t] = (tc[label][t] || 0) + 1; });
    });
    const N = y.length;
    const all = new Set(X_tokens.flat());
    this.vocabSize = all.size;
    this.classes.forEach(c => {
      this.logPrior[c] = Math.log(cc[c] / N);
      const total = Object.values(tc[c]).reduce((s, v) => s + v, 0);
      this.logLikelihood[c] = {};
      all.forEach(t => {
        this.logLikelihood[c][t] = Math.log(
          ((tc[c][t] || 0) + this.alpha) / (total + this.alpha * this.vocabSize)
        );
      });
    });
  }

  predictProba(tokens) {
    const scores = {};
    this.classes.forEach(c => {
      scores[c] = this.logPrior[c];
      tokens.forEach(t => {
        scores[c] += this.logLikelihood[c]?.[t] ??
          Math.log(this.alpha / (this.alpha * (this.vocabSize || 1)));
      });
    });
    const maxS = Math.max(...Object.values(scores));
    let sum = 0;
    const exp = {};
    this.classes.forEach(c => { exp[c] = Math.exp(scores[c] - maxS); sum += exp[c]; });
    const p = {};
    this.classes.forEach(c => { p[c] = exp[c] / sum; });
    return p;
  }
}

// ── LOGISTIC REGRESSION ────────────────────────────────────────
class LogisticRegression {
  constructor(lr = 0.1, epochs = 200, lambda = 0.001) {
    this.lr = lr; this.epochs = epochs; this.lambda = lambda;
    this.models = {};
  }

  _sigmoid(x) { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
  _dot(a, b)   { return a.reduce((s, v, i) => s + v * (b[i] || 0), 0); }

  _trainBinary(X, y_bin) {
    const dim = X[0].length;
    let w = new Array(dim).fill(0).map(() => (Math.random() - 0.5) * 0.01);
    let b = 0;
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const lr_t = this.lr / (1 + 0.01 * epoch);
      const idx  = X.map((_, i) => i).sort(() => Math.random() - 0.5);
      idx.forEach(i => {
        const pred  = this._sigmoid(this._dot(w, X[i]) + b);
        const error = (y_bin[i] === 1 ? 1 : 0) - pred;
        w = w.map((v, j) => v + lr_t * (error * X[i][j] - this.lambda * v));
        b += lr_t * error;
      });
    }
    return { w, b };
  }

  fit(X, y) {
    [-1, 0, 1].forEach(c => {
      this.models[c] = this._trainBinary(X, y.map(l => l === c ? 1 : 0));
    });
  }

  predictProba(x) {
    const scores = {};
    [-1, 0, 1].forEach(c => {
      const { w, b } = this.models[c];
      scores[c] = this._sigmoid(this._dot(w, x) + b);
    });
    const sum = Object.values(scores).reduce((s, v) => s + v, 0) || 1;
    const p   = {};
    [-1, 0, 1].forEach(c => { p[c] = scores[c] / sum; });
    return p;
  }
}

// ── DATASET 1000+ EXEMPLES ─────────────────────────────────────
const TRAINING_DATA = [
  // ══════════ POSITIFS FR (160) ══════════
  {text:"Produit absolument fantastique je suis très satisfait",label:1},
  {text:"Excellent service livraison rapide emballage parfait",label:1},
  {text:"Je recommande vivement ce produit à tous",label:1},
  {text:"Qualité exceptionnelle rapport qualité prix imbattable",label:1},
  {text:"Service client exceptionnel problème résolu immédiatement",label:1},
  {text:"Très bonne expérience je suis vraiment impressionné",label:1},
  {text:"Parfait en tout point exactement ce que je cherchais",label:1},
  {text:"Magnifique produit je suis ravi de mon achat",label:1},
  {text:"Super rapide et efficace merci beaucoup",label:1},
  {text:"Incroyable qualité pour ce prix je suis bluffé",label:1},
  {text:"Produit conforme à la description livraison en avance",label:1},
  {text:"Très satisfait de cet achat je recommande",label:1},
  {text:"Excellent rapport qualité prix produit de grande qualité",label:1},
  {text:"Super produit fonctionne parfaitement bien",label:1},
  {text:"Très content de mon achat produit top",label:1},
  {text:"Fantastique au delà de mes espérances",label:1},
  {text:"Très bonne qualité livraison soignée et rapide",label:1},
  {text:"Service impeccable je suis totalement satisfait",label:1},
  {text:"Produit de qualité supérieure je suis enchanté",label:1},
  {text:"Agréable surprise bien meilleur que prévu",label:1},
  {text:"Livraison très rapide produit de très bonne qualité",label:1},
  {text:"Je suis extrêmement satisfait de cette commande",label:1},
  {text:"Produit superbe vraiment recommandé",label:1},
  {text:"Excellent achat je referai commande sans hésiter",label:1},
  {text:"Parfait livré rapidement très bonne qualité",label:1},
  {text:"Génial produit conforme emballage soigné",label:1},
  {text:"Je suis ravi qualité irréprochable",label:1},
  {text:"Produit de qualité livré rapidement emballé soigneusement",label:1},
  {text:"Très satisfaisant bon rapport qualité prix",label:1},
  {text:"Superbe produit je le recommande vivement",label:1},
  {text:"Excellent je suis très content de mon achat",label:1},
  {text:"Produit top qualité parfaite livraison rapide",label:1},
  {text:"Je recommande fortement excellent produit",label:1},
  {text:"Très bon produit satisfait du résultat",label:1},
  {text:"Formidable produit excellent rapport qualité prix",label:1},
  {text:"Produit remarquable je suis impressionné",label:1},
  {text:"Achat parfait je suis totalement satisfait",label:1},
  {text:"Qualité top service excellent livraison rapide",label:1},
  {text:"Très bien emballé produit conforme très satisfait",label:1},
  {text:"Produit excellent je recommande à tout le monde",label:1},
  {text:"Parfait service client agréable et réactif",label:1},
  {text:"Super qualité produit durable et solide",label:1},
  {text:"Vraiment satisfait du produit bon rapport qualité prix",label:1},
  {text:"Produit de qualité irréprochable livraison impeccable",label:1},
  {text:"Très bon achat produit fiable et durable",label:1},
  {text:"Commande reçue rapidement produit excellent",label:1},
  {text:"Très satisfait produit conforme à mes attentes",label:1},
  {text:"Produit de qualité prix raisonnable je recommande",label:1},
  {text:"Parfait produit solide et bien conçu",label:1},
  {text:"Excellent produit satisfait à cent pour cent",label:1},
  {text:"Je suis content qualité au rendez-vous",label:1},
  {text:"Super achat produit conforme description rapide",label:1},
  {text:"Très bonne qualité je referai un achat",label:1},
  {text:"Produit top je suis ravi excellent service",label:1},
  {text:"Satisfait du produit livraison rapide",label:1},
  {text:"Bonne qualité bon prix je recommande",label:1},
  {text:"Produit bien conçu solide et fiable",label:1},
  {text:"Je suis satisfait du produit et du service",label:1},
  {text:"Très bien produit de bonne qualité",label:1},
  {text:"Produit reçu en bon état conforme satisfait",label:1},
  {text:"Remboursement rapide et sans problème bravo",label:1},
  {text:"Prix très abordable pour cette qualité surpris",label:1},
  {text:"Livraison express emballage soigné produit parfait",label:1},
  {text:"Service après vente réactif problème résolu rapidement",label:1},
  {text:"Très beau produit esthétique et fonctionnel",label:1},
  {text:"Rapport qualité prix excellent très content",label:1},
  {text:"Produit robuste et fiable exactement comme décrit",label:1},
  {text:"Livraison ponctuelle produit en parfait état",label:1},
  {text:"Très satisfait de la qualité et du service client",label:1},
  {text:"Produit premium pour un prix raisonnable",label:1},
  {text:"Service client très professionnel et compétent",label:1},
  {text:"Très heureux de mon achat je recommande sans hésitation",label:1},
  {text:"Produit utile pratique et de bonne qualité",label:1},
  {text:"Livraison soignée produit en excellent état",label:1},
  {text:"Très bien rapport qualité prix imbattable",label:1},
  {text:"Produit élégant de bonne facture je suis content",label:1},
  {text:"Service rapide et efficace très satisfait",label:1},
  {text:"Produit conforme photos et description je recommande",label:1},
  {text:"Très satisfait produit dépassé mes attentes",label:1},
  {text:"Bon produit prix correct livraison rapide",label:1},
  {text:"Produit excellent emballage soigné livraison express",label:1},
  {text:"Superbe qualité je suis impressionné par ce produit",label:1},
  {text:"Très content achat recommandé qualité prix",label:1},
  {text:"Produit parfait service client aimable",label:1},
  {text:"Excellent produit très bien emballé livraison rapide",label:1},
  {text:"Je suis vraiment ravi de cet achat",label:1},
  {text:"Produit top notch qualité irréprochable",label:1},
  {text:"Très satisfait livraison rapide produit conforme",label:1},
  {text:"Produit de qualité superior très satisfait",label:1},
  {text:"Excellent achat je suis ravi",label:1},
  {text:"Produit génial rapport qualité prix excellent",label:1},
  {text:"Très bonne livraison produit en parfait état",label:1},
  {text:"Satisfait de la qualité et du service",label:1},
  {text:"Produit parfait pour mes besoins je recommande",label:1},
  {text:"Très bon produit emballage parfait",label:1},
  {text:"Produit de qualité livraison très rapide",label:1},
  {text:"Je suis enchanté par ce produit",label:1},
  {text:"Très bonne expérience d achat je recommande",label:1},
  {text:"Produit excellent rapport qualité prix parfait",label:1},
  {text:"Très satisfait qualité au top",label:1},
  {text:"Produit solide et bien fini je suis ravi",label:1},
  // Cas avec prix/retour positifs FR
  {text:"Prix très raisonnable pour une excellente qualité",label:1},
  {text:"Remboursement effectué rapidement service impeccable",label:1},
  {text:"Très bon rapport qualité prix je recommande",label:1},
  {text:"Echange facile et rapide service client au top",label:1},
  {text:"Prix abordable produit de qualité je recommande",label:1},
  {text:"Retour simple et remboursement rapide bravo",label:1},
  {text:"Excellent rapport qualité prix vraiment satisfait",label:1},
  {text:"Bonne valeur pour l argent produit solide",label:1},
  {text:"Prix correct qualité supérieure à mes attentes",label:1},
  {text:"Très bonne affaire qualité prix imbattable",label:1},
  // Cas avec mais/pourtant → positif dominant
  {text:"Livraison un peu longue mais produit vraiment excellent",label:1},
  {text:"Emballage basique mais qualité du produit parfaite",label:1},
  {text:"Prix un peu élevé mais qualité irréprochable",label:1},
  {text:"Site un peu lent mais produit excellent",label:1},
  {text:"Léger défaut d emballage mais produit superbe",label:1},
  {text:"Quelques jours de retard mais produit fantastique",label:1},
  {text:"Pas parfait mais très bon produit je recommande",label:1},
  {text:"Peut mieux faire sur le délai mais qualité top",label:1},
  {text:"Packaging simple pourtant produit de très bonne qualité",label:1},
  {text:"Un peu cher mais vraiment excellent produit",label:1},
  // Nouveaux exemples diversifiés FR positifs
  {text:"Très beau produit livraison parfaite",label:1},
  {text:"Produit de grande qualité je le recommande à tous",label:1},
  {text:"Fantastique produit fiable et solide",label:1},
  {text:"Excellent service réactif et professionnel",label:1},
  {text:"Produit superbe rapport qualité prix excellent",label:1},
  {text:"Très bon produit conforme à la description",label:1},
  {text:"Je suis très satisfait de cet excellent produit",label:1},
  {text:"Livraison rapide produit de qualité je recommande",label:1},
  {text:"Superbe produit livré en parfait état",label:1},
  {text:"Très content de mon achat excellent produit",label:1},

  // ══════════ NÉGATIFS FR (160) ══════════
  {text:"Produit de très mauvaise qualité je suis déçu",label:-1},
  {text:"Livraison très lente et service client inexistant",label:-1},
  {text:"Je ne recommande absolument pas ce produit",label:-1},
  {text:"Catastrophique produit cassé à la réception",label:-1},
  {text:"Terrible expérience jamais je n achèterai ici",label:-1},
  {text:"Très déçu qualité ne correspond pas description",label:-1},
  {text:"Arnaque totale produit inutilisable dès premier jour",label:-1},
  {text:"Horrible service aucun remboursement malgré réclamation",label:-1},
  {text:"Qualité médiocre je regrette vraiment cet achat",label:-1},
  {text:"Pas du tout satisfait produit inférieur aux attentes",label:-1},
  {text:"Déplorable jamais vu un service aussi mauvais",label:-1},
  {text:"Très mauvaise expérience produit défectueux",label:-1},
  {text:"Nul le produit ne fonctionne pas du tout",label:-1},
  {text:"Pire achat de ma vie je suis très mécontent",label:-1},
  {text:"Escroquerie produit différent de la photo",label:-1},
  {text:"Décevant ne vaut pas du tout le prix payé",label:-1},
  {text:"Produit fragile et de mauvaise facture",label:-1},
  {text:"Service après vente inexistant vraiment honteux",label:-1},
  {text:"Qualité très insuffisante pour ce tarif",label:-1},
  {text:"Produit tombé en panne rapidement très insatisfait",label:-1},
  {text:"Mauvaise qualité produit cassé dès réception",label:-1},
  {text:"Service client terrible aucune réponse à mes mails",label:-1},
  {text:"Produit défectueux retour impossible service nul",label:-1},
  {text:"Très déçu produit pas conforme à la description",label:-1},
  {text:"Arnaque produit complètement inutilisable",label:-1},
  {text:"Horrible expérience produit cassé emballage abîmé",label:-1},
  {text:"Qualité nulle prix exorbitant je regrette",label:-1},
  {text:"Produit nul service client inexistant",label:-1},
  {text:"Mauvaise expérience produit ne correspond pas",label:-1},
  {text:"Déçu qualité très inférieure aux photos",label:-1},
  {text:"Produit inutilisable retourné remboursement refusé",label:-1},
  {text:"Très mauvais produit qualité déplorable",label:-1},
  {text:"Service client horrible pas de solution proposée",label:-1},
  {text:"Produit défectueux dès ouverture boîte déçu",label:-1},
  {text:"Arnaque complète produit jamais reçu",label:-1},
  {text:"Très insatisfait qualité exécrable",label:-1},
  {text:"Produit mauvaise qualité fragile inutilisable",label:-1},
  {text:"Horrible service client aucun suivi",label:-1},
  {text:"Très déçu produit ne dure pas",label:-1},
  {text:"Mauvais produit cassé rapidement déçu",label:-1},
  {text:"Service lamentable produit de mauvaise qualité",label:-1},
  {text:"Je déconseille fortement ce produit",label:-1},
  {text:"Produit décevant qualité insuffisante",label:-1},
  {text:"Très mauvais rapport qualité prix déçu",label:-1},
  {text:"Produit nul ne fonctionne pas correctement",label:-1},
  {text:"Service client déplorable pas de réponse",label:-1},
  {text:"Produit cassé fragile de mauvaise qualité",label:-1},
  {text:"Très insatisfait du produit et du service",label:-1},
  {text:"Mauvaise qualité prix trop élevé déçu",label:-1},
  {text:"Produit catastrophique je suis très mécontent",label:-1},
  {text:"Expérience horrible produit défaillant",label:-1},
  {text:"Produit arrivé abîmé service client nul",label:-1},
  {text:"Très mauvaise qualité produit inutile",label:-1},
  {text:"Déplorable qualité lamentable prix abusif",label:-1},
  {text:"Produit ne marche pas du tout nul",label:-1},
  {text:"Terrible qualité ne recommande pas",label:-1},
  {text:"Produit défectueux décevant mauvaise qualité",label:-1},
  {text:"Très mécontent qualité très mauvaise",label:-1},
  {text:"Arnaque produit faux très déçu",label:-1},
  {text:"Produit horrible cassé à réception déçu",label:-1},
  // Prix / retour / délai négatifs FR
  {text:"Beaucoup trop cher pour cette qualité médiocre",label:-1},
  {text:"Prix exorbitant produit de mauvaise qualité arnaque",label:-1},
  {text:"Remboursement refusé malgré produit défectueux scandaleux",label:-1},
  {text:"Retour impossible service client inexistant honteux",label:-1},
  {text:"Livraison avec deux semaines de retard inacceptable",label:-1},
  {text:"Délai de livraison catastrophique produit jamais arrivé",label:-1},
  {text:"Prix abusif qualité très décevante je regrette",label:-1},
  {text:"Trop cher pour ce que c est vraiment déçu",label:-1},
  {text:"Remboursement toujours pas reçu après 3 semaines scandaleux",label:-1},
  {text:"Produit perdu par le transporteur aucune aide du vendeur",label:-1},
  {text:"Frais de retour à ma charge inadmissible",label:-1},
  {text:"Délai annoncé non respecté très déçu du service",label:-1},
  {text:"Prix surfacturé produit ne vaut pas la moitié du prix",label:-1},
  {text:"Retour refusé alors que produit défectueux honteux",label:-1},
  {text:"Livraison très en retard emballage abîmé déçu",label:-1},
  // Cas avec mais/pourtant → négatif dominant
  {text:"Produit correct mais service client absolument horrible",label:-1},
  {text:"Emballage joli mais produit complètement cassé",label:-1},
  {text:"Livraison rapide mais produit de très mauvaise qualité",label:-1},
  {text:"Prix bas mais qualité nulle arnaque totale",label:-1},
  {text:"Bien emballé pourtant produit défectueux dès premier usage",label:-1},
  {text:"Présenté comme solide mais cassé en deux jours déçu",label:-1},
  {text:"Produit neuf en apparence cependant défaut de fabrication",label:-1},
  {text:"Service client souriant toutefois aucune solution proposée",label:-1},
  {text:"Photos attrayantes mais produit rien à voir déception",label:-1},
  {text:"Bien décrit sur site mais réalité totalement différente",label:-1},
  // Nouveaux exemples diversifiés FR négatifs
  {text:"Produit cassé dès le premier jour inadmissible",label:-1},
  {text:"Très déçu par la qualité de ce produit",label:-1},
  {text:"Service client inexistant problème non résolu",label:-1},
  {text:"Produit inutilisable arnaque complète",label:-1},
  {text:"Très mauvaise expérience je déconseille",label:-1},
  {text:"Qualité très décevante ne correspond pas",label:-1},
  {text:"Produit fragile et de mauvaise qualité",label:-1},
  {text:"Service après vente désastreux",label:-1},
  {text:"Très mécontent de cet achat",label:-1},
  {text:"Produit défectueux service client nul",label:-1},
  {text:"Livraison catastrophique produit abîmé",label:-1},
  {text:"Mauvaise qualité prix excessif déçu",label:-1},
  {text:"Produit ne fonctionne pas comme décrit",label:-1},
  {text:"Très déçu de la qualité et du service",label:-1},
  {text:"Arnaque totale produit faux",label:-1},
  {text:"Remboursement impossible service horrible",label:-1},
  {text:"Produit en retard et de mauvaise qualité",label:-1},
  {text:"Cher et de mauvaise qualité déçu",label:-1},
  {text:"Produit abîmé à la réception et retour refusé",label:-1},
  {text:"Très mauvais produit et service client déplorable",label:-1},
  {text:"Je suis très déçu de cet achat",label:-1},
  {text:"Produit pas conforme arnaque",label:-1},
  {text:"Service client horrible aucune réponse",label:-1},
  {text:"Produit catastrophique qualité nulle",label:-1},
  {text:"Très insatisfait du produit et service",label:-1},

  // ══════════ NEUTRES FR (60) ══════════
  {text:"Produit correct ni excellent ni mauvais",label:0},
  {text:"Livraison dans les délais produit conforme",label:0},
  {text:"Rien d exceptionnel mais ça fait le travail",label:0},
  {text:"Produit moyen quelques défauts mais acceptable",label:0},
  {text:"Correct pour le prix sans plus",label:0},
  {text:"Emballage bien fait mais produit ordinaire",label:0},
  {text:"Livraison correcte produit standard",label:0},
  {text:"Pas de mauvaise surprise produit honnête",label:0},
  {text:"Qualité moyenne prix raisonnable",label:0},
  {text:"Service acceptable dans la moyenne",label:0},
  {text:"Produit convenable rien de remarquable",label:0},
  {text:"Correct sans plus quelques défauts mineurs",label:0},
  {text:"Produit moyen livraison correcte",label:0},
  {text:"Acceptable pour le prix",label:0},
  {text:"Produit dans la moyenne rien de spécial",label:0},
  {text:"Qualité ordinaire prix correct",label:0},
  {text:"Livraison normale produit comme attendu",label:0},
  {text:"Produit basique fait le travail",label:0},
  {text:"Correct sans être exceptionnel",label:0},
  {text:"Produit standard qualité correcte",label:0},
  {text:"Ni bon ni mauvais produit ordinaire",label:0},
  {text:"Produit moyen mais prix correct",label:0},
  {text:"Service correct produit conforme",label:0},
  {text:"Acceptable qualité moyenne",label:0},
  {text:"Produit honnête rien de plus",label:0},
  {text:"Livraison correcte produit sans surprise",label:0},
  {text:"Qualité convenable prix raisonnable",label:0},
  {text:"Produit correct livré dans les temps",label:0},
  {text:"Service ordinaire produit standard",label:0},
  {text:"Correct pour usage basique",label:0},
  {text:"Prix normal qualité dans la moyenne",label:0},
  {text:"Livraison ok produit pas exceptionnel",label:0},
  {text:"Produit fonctionnel rien de plus",label:0},
  {text:"Moyen ni une bonne ni mauvaise expérience",label:0},
  {text:"Produit ordinaire rapport qualité prix correct",label:0},
  {text:"Service neutre produit dans la norme",label:0},
  {text:"Correct quelques petits défauts sans importance",label:0},
  {text:"Produit utilisable qualité acceptable",label:0},
  {text:"Livraison tardive mais produit conforme",label:0},
  {text:"Produit de base pour un usage simple",label:0},
  {text:"Quelques points positifs et négatifs au final correct",label:0},
  {text:"Produit mitigé des points bons et mauvais",label:0},
  {text:"Expérience sans surprise positive ni négative",label:0},
  {text:"Produit qui remplit sa fonction sans plus",label:0},
  {text:"Résultat attendu sans mauvaise surprise",label:0},
  {text:"Produit moyen bon rapport qualité prix",label:0},
  {text:"Pas terrible mais convenable pour le prix",label:0},
  {text:"Produit correct livraison dans les délais",label:0},
  {text:"Qualité passable prix dans la moyenne",label:0},
  {text:"Produit standard sans défaut majeur",label:0},
  {text:"Expérience correcte pas de problème particulier",label:0},
  {text:"Produit honnête qualité correcte",label:0},
  {text:"Livraison en temps normal produit correct",label:0},
  {text:"Produit de qualité moyenne pour ce prix",label:0},
  {text:"Correct pour les besoins de base",label:0},
  {text:"Produit ok quelques points à améliorer",label:0},
  {text:"Service dans la norme produit correct",label:0},
  {text:"Produit acceptable sans plus",label:0},
  {text:"Ni excellent ni mauvais juste moyen",label:0},
  {text:"Produit basique qui fait son travail",label:0},

  // ══════════ POSITIFS EN (160) ══════════
  {text:"Absolutely fantastic product highly recommend",label:1},
  {text:"Excellent service fast delivery perfect packaging",label:1},
  {text:"Amazing quality best purchase I have made",label:1},
  {text:"Outstanding customer service resolved issue immediately",label:1},
  {text:"Great value for money really impressed",label:1},
  {text:"Perfect product exactly what I was looking for",label:1},
  {text:"Wonderful experience very satisfied with purchase",label:1},
  {text:"Superb quality exceeded all my expectations",label:1},
  {text:"Brilliant product works perfectly love it",label:1},
  {text:"Exceptional quality fast shipping very happy",label:1},
  {text:"Highly recommend this incredible product",label:1},
  {text:"Five stars amazing product great price",label:1},
  {text:"Fantastic quick delivery very pleased",label:1},
  {text:"Excellent product great quality will buy again",label:1},
  {text:"Awesome product very happy with the results",label:1},
  {text:"Top quality product exactly as described",label:1},
  {text:"Really great product very impressed with quality",label:1},
  {text:"Wonderful product came quickly very satisfied",label:1},
  {text:"Best product ever bought absolutely love it",label:1},
  {text:"Perfect just what I needed great service",label:1},
  {text:"Fantastic quality arrived quickly well packaged",label:1},
  {text:"Extremely happy with this purchase excellent quality",label:1},
  {text:"Superb product truly recommend it",label:1},
  {text:"Excellent buy will order again without hesitation",label:1},
  {text:"Perfect fast delivery very good quality",label:1},
  {text:"Brilliant product as described fast shipping",label:1},
  {text:"Really satisfied with quality and service",label:1},
  {text:"Outstanding product fast delivery well packaged",label:1},
  {text:"Very satisfied great value excellent quality",label:1},
  {text:"Superb product highly recommend",label:1},
  {text:"Excellent very happy with my purchase",label:1},
  {text:"Top product perfect quality fast delivery",label:1},
  {text:"Strongly recommend excellent product",label:1},
  {text:"Very good product satisfied with result",label:1},
  {text:"Wonderful product excellent value for money",label:1},
  {text:"Remarkable product very impressed",label:1},
  {text:"Perfect purchase totally satisfied",label:1},
  {text:"Top quality excellent service fast delivery",label:1},
  {text:"Very well packaged great product satisfied",label:1},
  {text:"Excellent product recommend to everyone",label:1},
  {text:"Great service nice and responsive",label:1},
  {text:"Super quality durable and solid product",label:1},
  {text:"Really satisfied great value for money",label:1},
  {text:"Perfect quality flawless delivery",label:1},
  {text:"Very good buy reliable and durable product",label:1},
  {text:"Order received quickly excellent product",label:1},
  {text:"Very satisfied product met my expectations",label:1},
  {text:"Good quality reasonable price recommend",label:1},
  {text:"Perfect solid and well made product",label:1},
  {text:"Excellent product one hundred percent satisfied",label:1},
  {text:"Happy quality delivered as promised",label:1},
  {text:"Great buy product matches description fast",label:1},
  {text:"Very good quality will buy again",label:1},
  {text:"Top product happy excellent service",label:1},
  {text:"Satisfied with product fast delivery",label:1},
  {text:"Good quality good price recommend",label:1},
  {text:"Well designed solid and reliable",label:1},
  {text:"Satisfied with product and service",label:1},
  {text:"Very good product of good quality",label:1},
  {text:"Product received in good condition satisfied",label:1},
  // Prix/retour/délai positifs EN
  {text:"Very affordable for this excellent quality surprised",label:1},
  {text:"Refund processed quickly and smoothly excellent service",label:1},
  {text:"Great value for money best deal I found",label:1},
  {text:"Easy return process and fast refund highly recommend",label:1},
  {text:"Very reasonable price for outstanding quality",label:1},
  {text:"Fast delivery before expected date very happy",label:1},
  {text:"Good bargain great product highly recommend",label:1},
  {text:"Worth every penny outstanding quality",label:1},
  {text:"Excellent value very satisfied with the deal",label:1},
  {text:"Price perfectly matches quality great purchase",label:1},
  // Cas avec but/however → positif dominant EN
  {text:"Delivery was slow but product quality is excellent",label:1},
  {text:"Packaging basic but product itself is perfect",label:1},
  {text:"A bit expensive but quality is truly outstanding",label:1},
  {text:"Website slow but product is fantastic",label:1},
  {text:"Minor packaging issue but product is superb",label:1},
  {text:"Slight delay but product is absolutely fantastic",label:1},
  {text:"Not flawless but very good product highly recommend",label:1},
  {text:"Could improve delivery but quality is top notch",label:1},
  {text:"Simple packaging however product of great quality",label:1},
  {text:"A bit pricey yet truly excellent product",label:1},
  // Nouveaux exemples diversifiés EN positifs
  {text:"Incredible product very fast delivery",label:1},
  {text:"Best quality product I have ever bought",label:1},
  {text:"Fantastic service resolved everything quickly",label:1},
  {text:"Excellent product superb quality fast delivery",label:1},
  {text:"Very good product highly recommend",label:1},
  {text:"I am extremely satisfied with this product",label:1},
  {text:"Fast delivery great quality I recommend",label:1},
  {text:"Superb product delivered in perfect condition",label:1},
  {text:"Very happy with my purchase excellent product",label:1},
  {text:"Outstanding quality great price will order again",label:1},
  {text:"Perfect product exactly as described",label:1},
  {text:"Amazing product works perfectly",label:1},
  {text:"Great customer service very helpful",label:1},
  {text:"Top quality product very satisfied",label:1},
  {text:"Excellent packaging fast delivery great product",label:1},
  {text:"Very impressed with the quality of this product",label:1},
  {text:"Brilliant quality product highly recommend",label:1},
  {text:"Really happy with this purchase",label:1},
  {text:"Wonderful product great value",label:1},
  {text:"Perfect purchase very satisfied",label:1},

  // ══════════ NÉGATIFS EN (160) ══════════
  {text:"Terrible product broke after one day",label:-1},
  {text:"Very disappointed with the quality not as described",label:-1},
  {text:"Worst purchase ever complete waste of money",label:-1},
  {text:"Awful service no response to my complaints",label:-1},
  {text:"Defective product arrived broken terrible experience",label:-1},
  {text:"Do not buy this product it is garbage",label:-1},
  {text:"Horrible quality fell apart immediately",label:-1},
  {text:"Disgusting service refused to give refund",label:-1},
  {text:"Poor quality not worth the money at all",label:-1},
  {text:"Extremely disappointed very bad product",label:-1},
  {text:"Scam product looks nothing like the pictures",label:-1},
  {text:"Useless product stopped working after a week",label:-1},
  {text:"Never buying here again terrible experience",label:-1},
  {text:"Very poor craftsmanship broke immediately",label:-1},
  {text:"Waste of money very unhappy with purchase",label:-1},
  {text:"Bad quality product not as advertised",label:-1},
  {text:"Very bad experience product did not work",label:-1},
  {text:"Disappointed quality is very poor for the price",label:-1},
  {text:"Horrible product would not recommend to anyone",label:-1},
  {text:"Complete rubbish broken on arrival terrible",label:-1},
  {text:"Bad quality product broke quickly disappointed",label:-1},
  {text:"Terrible customer service no reply to emails",label:-1},
  {text:"Defective product return impossible terrible service",label:-1},
  {text:"Very disappointed product not matching description",label:-1},
  {text:"Scam completely useless product",label:-1},
  {text:"Horrible experience broken product damaged packaging",label:-1},
  {text:"Terrible quality overpriced regret buying",label:-1},
  {text:"Useless product terrible customer service",label:-1},
  {text:"Bad experience product does not match",label:-1},
  {text:"Disappointed quality far below pictures",label:-1},
  {text:"Unusable product returned refund refused",label:-1},
  {text:"Very bad product appalling quality",label:-1},
  {text:"Terrible customer service no solution offered",label:-1},
  {text:"Defective product on opening box disappointed",label:-1},
  {text:"Complete scam product never received",label:-1},
  {text:"Very unsatisfied execrable quality",label:-1},
  {text:"Bad quality product fragile unusable",label:-1},
  {text:"Terrible customer service no follow up",label:-1},
  {text:"Very disappointed product does not last",label:-1},
  {text:"Bad product broke quickly disappointed",label:-1},
  {text:"Awful service product of bad quality",label:-1},
  {text:"Strongly advise against this product",label:-1},
  {text:"Disappointing product insufficient quality",label:-1},
  {text:"Very bad value for money disappointed",label:-1},
  {text:"Useless product does not work properly",label:-1},
  {text:"Terrible customer service no response",label:-1},
  {text:"Broken fragile product of bad quality",label:-1},
  {text:"Very unsatisfied with product and service",label:-1},
  {text:"Bad quality overpriced disappointed",label:-1},
  {text:"Catastrophic product very unhappy",label:-1},
  {text:"Horrible experience faulty product",label:-1},
  {text:"Product arrived damaged terrible service",label:-1},
  {text:"Very bad quality useless product",label:-1},
  {text:"Appalling quality outrageous price",label:-1},
  {text:"Product does not work at all useless",label:-1},
  {text:"Terrible quality do not recommend",label:-1},
  {text:"Defective disappointing bad quality",label:-1},
  {text:"Very unhappy very bad quality",label:-1},
  {text:"Scam fake product very disappointed",label:-1},
  {text:"Horrible product broken on arrival disappointed",label:-1},
  // Prix/retour/délai négatifs EN
  {text:"Ridiculously overpriced for such poor quality",label:-1},
  {text:"Way too expensive for what it is disappointing",label:-1},
  {text:"Refund refused despite defective product outrageous",label:-1},
  {text:"Return impossible no customer support disgusting",label:-1},
  {text:"Delivery two weeks late completely unacceptable",label:-1},
  {text:"Package never arrived no help from seller terrible",label:-1},
  {text:"Overpriced cheap quality total rip-off",label:-1},
  {text:"Too expensive for this mediocre quality very disappointed",label:-1},
  {text:"No refund after 3 weeks still waiting outrageous",label:-1},
  {text:"Product lost by courier seller refused to help terrible",label:-1},
  {text:"Return costs charged to me unacceptable bad service",label:-1},
  {text:"Promised delivery not respected very disappointed",label:-1},
  {text:"Overcharged product not worth half the price scam",label:-1},
  {text:"Return refused even though product was broken disgusting",label:-1},
  {text:"Very late delivery damaged packaging disappointed",label:-1},
  // Cas avec but/however → négatif dominant EN
  {text:"Product looks ok but customer service is absolutely terrible",label:-1},
  {text:"Nice packaging but product completely broken inside",label:-1},
  {text:"Fast delivery but product of very poor quality",label:-1},
  {text:"Low price but quality is terrible total scam",label:-1},
  {text:"Well packaged however product defective on first use",label:-1},
  {text:"Seemed solid but broke in two days very disappointed",label:-1},
  {text:"New in appearance yet major manufacturing defect",label:-1},
  {text:"Friendly staff but absolutely no solution provided",label:-1},
  {text:"Nice photos but real product completely different",label:-1},
  {text:"Well described on site but reality totally different",label:-1},
  // Nouveaux exemples diversifiés EN négatifs
  {text:"Product broke on first day unacceptable",label:-1},
  {text:"Very disappointed by the quality of this product",label:-1},
  {text:"Customer service non existent problem not resolved",label:-1},
  {text:"Product unusable complete scam",label:-1},
  {text:"Very bad experience strongly advise against",label:-1},
  {text:"Quality very disappointing does not match",label:-1},
  {text:"Fragile product of very bad quality",label:-1},
  {text:"After sales service disastrous",label:-1},
  {text:"Very unhappy with this purchase",label:-1},
  {text:"Defective product terrible customer service",label:-1},
  {text:"Catastrophic delivery product damaged",label:-1},
  {text:"Bad quality excessive price disappointed",label:-1},
  {text:"Product does not work as described",label:-1},
  {text:"Very disappointed with quality and service",label:-1},
  {text:"Total scam fake product",label:-1},
  {text:"No refund possible horrible service",label:-1},
  {text:"Late and bad quality disappointed",label:-1},
  {text:"Expensive and bad quality disappointed",label:-1},
  {text:"Damaged on arrival and return refused",label:-1},
  {text:"Very bad product and terrible customer service",label:-1},

  // ══════════ NEUTRES EN (60) ══════════
  {text:"Product is okay nothing special does the job",label:0},
  {text:"Delivery on time product as described nothing more",label:0},
  {text:"Average product some minor issues but acceptable",label:0},
  {text:"Decent quality reasonable price not amazing",label:0},
  {text:"It works fine no complaints but nothing special",label:0},
  {text:"Fairly standard product meets basic expectations",label:0},
  {text:"Normal delivery average product quality",label:0},
  {text:"Neither good nor bad it is what it is",label:0},
  {text:"Acceptable for the price average quality",label:0},
  {text:"Mediocre product but priced accordingly",label:0},
  {text:"Product fine nothing remarkable",label:0},
  {text:"Correct nothing special minor defects",label:0},
  {text:"Average product correct delivery",label:0},
  {text:"Acceptable for the price",label:0},
  {text:"Product average nothing special",label:0},
  {text:"Ordinary quality correct price",label:0},
  {text:"Normal delivery product as expected",label:0},
  {text:"Basic product does the job",label:0},
  {text:"Correct without being exceptional",label:0},
  {text:"Standard product correct quality",label:0},
  {text:"Neither good nor bad ordinary product",label:0},
  {text:"Average product but correct price",label:0},
  {text:"Correct service product matching",label:0},
  {text:"Acceptable average quality",label:0},
  {text:"Honest product nothing more",label:0},
  {text:"Correct delivery product no surprise",label:0},
  {text:"Acceptable quality reasonable price",label:0},
  {text:"Correct product delivered on time",label:0},
  {text:"Ordinary service standard product",label:0},
  {text:"Correct for basic use",label:0},
  {text:"Normal price average quality",label:0},
  {text:"Delivery ok product not exceptional",label:0},
  {text:"Functional product nothing more",label:0},
  {text:"Average neither good nor bad experience",label:0},
  {text:"Ordinary product correct value",label:0},
  {text:"Neutral service product within norms",label:0},
  {text:"Correct some small defects not important",label:0},
  {text:"Usable product acceptable quality",label:0},
  {text:"Late delivery but product matches description",label:0},
  {text:"Basic product for simple use",label:0},
  {text:"Some positives and negatives overall correct",label:0},
  {text:"Mixed product some good and bad points",label:0},
  {text:"Experience without surprise positive or negative",label:0},
  {text:"Product fulfills its function nothing more",label:0},
  {text:"Expected result no bad surprise",label:0},
  {text:"Average product good value for money",label:0},
  {text:"Not great but acceptable for the price",label:0},
  {text:"Correct product delivery on time",label:0},
  {text:"Passable quality average price",label:0},
  {text:"Standard product no major defect",label:0},
  {text:"Correct experience no particular problem",label:0},
  {text:"Honest product correct quality",label:0},
  {text:"On time delivery correct product",label:0},
  {text:"Average quality product for this price",label:0},
  {text:"Correct for basic needs",label:0},
  {text:"Product ok some points to improve",label:0},
  {text:"Service within norms correct product",label:0},
  {text:"Acceptable product nothing more",label:0},
  {text:"Neither excellent nor bad just average",label:0},
  {text:"Basic product doing its job",label:0},


  // ══════════ CAS HESITATION → POSITIF (exemples ciblés) ══════════
  {text:"Was skeptical at first but product is absolutely phenomenal highly recommend",label:1},
  {text:"Initially nervous about ordering but product exceeded every expectation",label:1},
  {text:"Had concerns before buying but completely blown away by the quality",label:1},
  {text:"Despite initial worries product is outstanding and delivery was perfect",label:1},
  {text:"Was worried it would not arrive on time but it came early and is perfect",label:1},
  {text:"Ordered as gift nervous about quality but recipient absolutely delighted",label:1},
  {text:"Low price made me skeptical but quality is surprisingly excellent",label:1},
  {text:"Doubted the quality at first but product is genuinely remarkable",label:1},
  {text:"Expected little but this product completely blew me away fantastic",label:1},
  {text:"Not sure at first but after using it I am extremely satisfied",label:1},
  {text:"J avais des doutes mais le produit est vraiment exceptionnel je recommande",label:1},
  {text:"Hesitant au debut mais j ai ete completement bluffe par la qualite",label:1},
  {text:"Prix bas m inquietait mais qualite vraiment surprenante tres satisfait",label:1},
  {text:"Pas convaincu au depart mais tres agreablement surpris au final",label:1},
  // ══════════ CAS COMPLEXES & EDGE CASES (40) ══════════
  {text:"Pas du tout satisfait vraiment décevant",label:-1},
  {text:"Not at all what I expected very disappointing",label:-1},
  {text:"Tout à fait excellent vraiment impressionnant",label:1},
  {text:"Absolutely not recommended terrible quality",label:-1},
  {text:"Je ne suis pas content du tout de ce produit",label:-1},
  {text:"Bien meilleur que ce à quoi je m attendais",label:1},
  {text:"Much better than expected really surprised",label:1},
  {text:"Pas terrible mais convenable pour le prix",label:0},
  {text:"Not bad not great just average experience",label:0},
  {text:"Couldn t be happier with this amazing purchase",label:1},
  {text:"Could not be more disappointed terrible product",label:-1},
  {text:"Jamais vu une telle qualité vraiment impressionné",label:1},
  {text:"Never seen such poor quality extremely disappointed",label:-1},
  {text:"Pas exceptionnel mais correct pour le prix",label:0},
  {text:"Not exceptional but okay for the price",label:0},
  // Cas prix contrastés
  {text:"Cher mais honnêtement qualité au rendez vous",label:1},
  {text:"Expensive but honestly the quality is worth it",label:1},
  {text:"Prix élevé cependant produit vraiment excellent",label:1},
  {text:"Pricey however product is truly outstanding",label:1},
  {text:"Cher mais vraiment décevant pour ce tarif",label:-1},
  {text:"Very expensive and very bad quality not worth it",label:-1},
  {text:"Prix correct mais qualité décevante",label:-1},
  {text:"Reasonable price but disappointing quality",label:-1},
  // Cas délai contrastés
  {text:"Retard de livraison mais produit de qualité",label:0},
  {text:"Delayed delivery but product is good",label:0},
  {text:"Livraison tardive et produit cassé double déception",label:-1},
  {text:"Very late and product damaged terrible experience",label:-1},
  // Cas remboursement
  {text:"Remboursement rapide malgré le problème bravo",label:1},
  {text:"Refund done quickly despite the issue well done",label:1},
  {text:"Remboursement refusé et produit défectueux scandaleux",label:-1},
  {text:"Refund refused and product broken outrageous",label:-1},
  // Service client contrasté
  {text:"Produit décevant mais service client très réactif",label:0},
  {text:"Bad product but customer service was excellent",label:0},
  {text:"Excellent produit mais service client nul",label:0},
  {text:"Great product but terrible customer service",label:0},
  // Intensificateurs forts
  {text:"Absolument catastrophique le pire achat de ma vie",label:-1},
  {text:"Absolutely catastrophic the worst purchase ever made",label:-1},
  {text:"Incroyablement satisfait au delà de toutes mes attentes",label:1},
  {text:"Incredibly satisfied beyond all my expectations",label:1},
];

// ── ENSEMBLE MODEL ─────────────────────────────────────────────
class EnsembleNLP {
  constructor() {
    this.tfidf   = new TFIDF(500);
    this.nb      = new NaiveBayes(0.3);
    this.lr      = new LogisticRegression(0.05, 300, 0.0005);
    this.trained = false;
    this.metrics = null;
  }

  train() {
    // 1. Shuffle + split AVANT tout entraînement
    const shuffled = [...TRAINING_DATA].sort(() => Math.random() - 0.5);
    const splitIdx = Math.floor(shuffled.length * 0.8);
    const trainSet = shuffled.slice(0, splitIdx);
    const testSet  = shuffled.slice(splitIdx);

    // 2. Features sur trainSet uniquement
    const X_tokens = trainSet.map(d => preprocessText(d.text));
    const y        = trainSet.map(d => d.label);

    // 3. Fit TF-IDF sur trainSet uniquement
    this.tfidf.fit(X_tokens);
    const X_vec = X_tokens.map(t => this.tfidf.transform(t));

    // 4. Entraîner les modèles
    this.nb.fit(X_tokens, y);
    this.lr.fit(X_vec, y);
    this.trained = true;

    // 5. Évaluer sur testSet (données jamais vues)
    this.metrics = this._evaluate(testSet);
    console.log(` Train: ${trainSet.length} ex. | Test: ${testSet.length} ex.`);
    console.log(` Accuracy: ${(this.metrics.accuracy * 100).toFixed(1)}% | F1: ${(this.metrics.macroF1 * 100).toFixed(1)}%`);
    return this.metrics;
  }

  predict(text) {
    if (!this.trained) throw new Error("Modèle non entraîné");

    const tokens     = preprocessText(text);
    const vec        = this.tfidf.transform(tokens);
    const negInfo    = detectNegation(text);
    const contrastInfo = detectContrast(text);

    // 3 votants
    const nbProba  = this.nb.predictProba(tokens);
    const lrProba  = this.lr.predictProba(vec);
    const lexProba = lexiconScore(text);

    // Poids adaptatifs
    const lexStrength = Math.abs(lexProba.score);
    const lexWeight   = lexStrength > 0.3 ? 0.4 : 0.2;
    const mlWeight    = 1 - lexWeight;
    const nbW = mlWeight * 0.4;
    const lrW = mlWeight * 0.6;

    const final = {};
    [-1, 0, 1].forEach(c => {
      final[c] = nbW * (nbProba[c] || 0)
               + lrW * (lrProba[c] || 0)
               + lexWeight * (lexProba[c] || lexProba[String(c)] || 0);
    });

    // Correction négation
    if (negInfo.hasNeg) { final[1] *= 0.55; final[-1] *= 1.5; }

    // Correction contraste — signal plus incertain → pousser vers neutre légèrement
    if (contrastInfo.hasContrast) {
      final[0] *= 1.2;
    }

    // Re-normaliser
    const sum = Object.values(final).reduce((s, v) => s + Math.max(0, v), 0) || 1;
    [-1, 0, 1].forEach(c => { final[c] = Math.max(0, final[c]) / sum; });

    const score      = final[1] - final[-1];
    const pred       = parseInt(Object.entries(final).sort((a,b) => b[1]-a[1])[0][0]);
    const confidence = final[pred];
    const label      = pred === 1 ? "positif" : pred === -1 ? "négatif" : "neutre";

    return {
      label,
      score:      parseFloat(score.toFixed(3)),
      confidence: parseFloat(confidence.toFixed(3)),
      emotions:   detectEmotions(text, pred),
      lang:       detectLang(text),
      negation:   negInfo.hasNeg,
      contrast:   contrastInfo.hasContrast,
      tokens:     tokens.slice(0, 10),
      proba: { positif: final[1], neutre: final[0], negatif: final[-1] },
    };
  }

  _evaluate(testData) {
    const preds   = testData.map(d => {
      const r = this.predict(d.text);
      return r.label === "positif" ? 1 : r.label === "négatif" ? -1 : 0;
    });
    const actuals = testData.map(d => d.label);
    const correct = preds.filter((p, i) => p === actuals[i]).length;
    const accuracy = correct / testData.length;

    const classMetrics = {};
    [-1, 0, 1].forEach(c => {
      const tp = preds.filter((p, i) => p === c && actuals[i] === c).length;
      const fp = preds.filter((p, i) => p === c && actuals[i] !== c).length;
      const fn = preds.filter((p, i) => p !== c && actuals[i] === c).length;
      const precision = tp / (tp + fp) || 0;
      const recall    = tp / (tp + fn) || 0;
      const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
      classMetrics[c] = { precision, recall, f1 };
    });
    const macroF1 = Object.values(classMetrics).reduce((s, m) => s + m.f1, 0) / 3;
    return { accuracy, macroF1, classMetrics, testSize: testData.length };
  }
}

// ── FONCTIONS UTILITAIRES ──────────────────────────────────────
function detectEmotions(text, pred) {
  const lex = {
    "joie":      ["content","heureux","ravi","happy","joyful","delighted","satisfied","satisfait","enchanté"],
    "confiance": ["fiable","confiance","reliable","trustworthy","recommend","recommande","solide","durable"],
    "surprise":  ["incroyable","bluffé","surprised","amazing","fantastique","impressed","impressionné"],
    "colère":    ["furieux","énervé","angry","furious","outraged","horrible","awful","honteux","scandaleux"],
    "dégoût":    ["dégoûtant","nul","arnaque","scam","garbage","rubbish","terrible","inutilisable","escroquerie"],
    "tristesse": ["déçu","décevant","disappointed","sad","regret","regrette","mécontent","unhappy"],
    "frustration":["retard","délai","late","delay","refusé","refused","impossible","inexistant"],
  };
  const lower = text.toLowerCase();
  const found = Object.entries(lex)
    .filter(([, words]) => words.some(w => lower.includes(w)))
    .map(([e]) => e);
  if (!found.length) return [pred===1?"satisfaction":pred===-1?"insatisfaction":"neutralité"];
  return found.slice(0, 3);
}

function detectLang(text) {
  const frWords = ["le","la","les","de","du","et","est","je","un","une","pas","très","produit",
                   "service","qualité","livraison","achat","satisfait","déçu","recommande","mais","prix"];
  const lower   = text.toLowerCase();
  return frWords.filter(w => lower.split(" ").includes(w)).length >= 2 ? "FR" : "EN";
}

// ── CHARGEMENT DES EXEMPLES VALIDÉS PAR L'ADMIN ───────────────
(function loadExtraData() {
  const fs   = require('fs');
  const path = require('path');
  const dataPath = path.join(__dirname, 'extra_data.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    const examples = JSON.parse(raw);
    if (Array.isArray(examples) && examples.length > 0) {
      // ── Vérification doublons par flagId ──────────────────
      const existingTexts = new Set(TRAINING_DATA.map(d => d.text.trim().toLowerCase()));
      let added = 0;
      examples.forEach(ex => {
        if (ex.text && ex.label !== undefined) {
          const key = ex.text.trim().toLowerCase();
          if (!existingTexts.has(key)) {
            TRAINING_DATA.push({ text: ex.text, label: Number(ex.label) });
            existingTexts.add(key);
            added++;
          }
        }
      });
      if (added > 0)
        console.log(` extra_data.json : ${added} exemple(s) validé(s) ajouté(s) au dataset`);
      else
        console.log(` extra_data.json : 0 nouveaux exemples (${examples.length} déjà présents)`);
    }
  } catch {
  }
})();

// ── EXPORT ─────────────────────────────────────────────────────
const model = new EnsembleNLP();
model.train();
module.exports = model;