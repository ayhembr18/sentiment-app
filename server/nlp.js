// ══════════════════════════════════════════════════════════════
//  NLP ENGINE v2 — Ensemble amélioré (cible: 90%+ accuracy)
//  Améliorations: dataset 300+, lexique sentiment, TF-IDF 500,
//  SVM optimisé, Logistic Regression, vote pondéré adaptatif
// ══════════════════════════════════════════════════════════════

// ── STOPWORDS ─────────────────────────────────────────────────
const STOPWORDS_FR = new Set([
  "le","la","les","un","une","des","du","de","et","en","au","aux","à","ce","se","sa","son","ses",
  "mon","ma","mes","ton","ta","tes","je","tu","il","elle","nous","vous","ils","elles","que","qui",
  "quoi","dans","sur","sous","par","pour","avec","sans","mais","ou","donc","or","ni","car","ne",
  "plus","bien","aussi","même","tout","tous","cette","cet","ces","ça","c","j","l","d","s","m",
  "n","y","si","là","où","dont","lorsque","quand","comment","pourquoi","est","sont","était","être",
]);
const STOPWORDS_EN = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","are",
  "was","were","be","been","have","has","had","do","does","did","will","would","could","should",
  "it","its","this","that","i","you","he","she","we","they","me","him","her","us","them","my",
  "your","his","our","their","what","which","who","when","where","why","how","so","just","get",
  "also","as","if","then","there","here","up","out","about","than","too","am","im","ive","its",
]);
const NEGATIONS = new Set([
  "pas","ne","jamais","aucun","rien","ni","non","sans","peu","guère","nullement","point",
  "not","no","never","neither","nor","without","hardly","barely","scarcely","dont","cant",
  "wont","isnt","arent","wasnt","werent","havent","hasnt","hadnt","wouldnt","couldnt","shouldnt",
]);

// ── LEXIQUE DE SENTIMENT (forte pondération) ──────────────────
const SENTIMENT_LEXICON = {
  // Très positifs FR
  "excellent": 3, "fantastique": 3, "parfait": 3, "exceptionnel": 3, "magnifique": 3,
  "extraordinaire": 3, "merveilleux": 3, "formidable": 3, "superbe": 3, "impeccable": 3,
  "remarquable": 3, "impressionnant": 3, "incroyable": 3, "splendide": 3, "admirable": 3,
  // Positifs FR
  "satisfait": 2, "content": 2, "heureux": 2, "ravi": 2, "enchanté": 2, "recommande": 2,
  "qualité": 1, "rapide": 1, "efficace": 1, "pratique": 1, "agréable": 1, "sympa": 1,
  "bon": 1, "bien": 1, "super": 2, "top": 2, "génial": 2, "cool": 1, "pro": 1,
  "livraison": 0, "conforme": 1, "soigné": 1, "fiable": 2, "durable": 1,
  // Très négatifs FR
  "catastrophique": -3, "horrible": -3, "terrible": -3, "désastreux": -3, "atroce": -3,
  "arnaque": -3, "escroquerie": -3, "nul": -3, "inexistant": -2, "honteux": -3,
  "scandaleux": -3, "déplorable": -3, "inadmissible": -3, "inacceptable": -2,
  // Négatifs FR
  "décevant": -2, "déçu": -2, "mauvais": -2, "défectueux": -2, "cassé": -2,
  "lent": -1, "cher": -1, "médiocre": -2, "insuffisant": -2, "fragile": -2,
  "inutilisable": -3, "mécontent": -2, "insatisfait": -2, "regrette": -2,
  // Très positifs EN
  "excellent": 3, "fantastic": 3, "perfect": 3, "exceptional": 3, "magnificent": 3,
  "outstanding": 3, "wonderful": 3, "superb": 3, "brilliant": 3, "amazing": 3,
  "incredible": 3, "flawless": 3, "spectacular": 3, "extraordinary": 3, "phenomenal": 3,
  // Positifs EN
  "satisfied": 2, "happy": 2, "pleased": 2, "delighted": 2, "recommend": 2,
  "great": 2, "good": 1, "nice": 1, "fast": 1, "quick": 1, "efficient": 1,
  "reliable": 2, "durable": 1, "quality": 1, "love": 2, "awesome": 2, "best": 2,
  // Très négatifs EN
  "terrible": -3, "horrible": -3, "awful": -3, "dreadful": -3, "atrocious": -3,
  "scam": -3, "garbage": -3, "useless": -3, "worthless": -3, "disgusting": -3,
  "catastrophic": -3, "disgraceful": -3, "appalling": -3, "outrageous": -3,
  // Négatifs EN
  "disappointed": -2, "disappointing": -2, "bad": -2, "defective": -2, "broken": -2,
  "slow": -1, "expensive": -1, "mediocre": -2, "cheap": -1, "flimsy": -2,
  "unusable": -3, "unhappy": -2, "unsatisfied": -2, "regret": -2, "waste": -2,
  "poor": -2, "worst": -3, "never": -1, "avoid": -2, "complaint": -2,
};

const INTENSIFIERS = {
  "très": 1.6, "vraiment": 1.5, "absolument": 1.8, "totalement": 1.6, "extrêmement": 1.9,
  "super": 1.4, "tellement": 1.5, "tout à fait": 1.6, "parfaitement": 1.6,
  "complètement": 1.6, "incroyablement": 1.8, "particulièrement": 1.4, "franchement": 1.3,
  "very": 1.6, "really": 1.5, "absolutely": 1.8, "totally": 1.6, "extremely": 1.9,
  "so": 1.4, "completely": 1.6, "incredibly": 1.8, "quite": 1.3, "pretty": 1.3,
  "especially": 1.4, "highly": 1.5, "deeply": 1.5, "utterly": 1.7, "truly": 1.5,
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
  const tokens = tokenize(text).map(stem);
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) bigrams.push(tokens[i] + "_" + tokens[i+1]);
  return [...tokens, ...bigrams];
}

function detectNegation(text) {
  const words = normalize(text).split(" ");
  const negPos = new Set();
  words.forEach((w, i) => {
    if (NEGATIONS.has(w)) {
      for (let j = i+1; j <= Math.min(i+4, words.length-1); j++) negPos.add(j);
    }
  });
  return { hasNeg: negPos.size > 0, negatedWords: new Set([...negPos].map(i => words[i])) };
}

// ── LEXIQUE SCORER (3ème votant) ───────────────────────────────
function lexiconScore(text) {
  const words = normalize(text).split(" ");
  let score = 0, count = 0;
  let intensifier = 1.0;

  words.forEach((w, i) => {
    // Vérifier intensificateur
    if (INTENSIFIERS[w]) { intensifier = INTENSIFIERS[w]; return; }

    const val = SENTIMENT_LEXICON[w] || SENTIMENT_LEXICON[stem(w)];
    if (val !== undefined) {
      // Vérifier négation dans fenêtre [-3, 0]
      let negated = false;
      for (let j = Math.max(0, i-3); j < i; j++) {
        if (NEGATIONS.has(words[j])) { negated = true; break; }
      }
      const contribution = val * intensifier * (negated ? -0.8 : 1.0);
      score += contribution;
      count++;
      intensifier = 1.0;
    }
  });

  const normalized = count > 0 ? score / (count * 3) : 0; // normaliser entre -1 et 1
  const clamped = Math.max(-1, Math.min(1, normalized));

  // Convertir en probabilités soft
  const pos = Math.max(0, clamped);
  const neg = Math.max(0, -clamped);
  const neu = 1 - pos - neg;
  const sum = pos + neg + Math.max(0.01, neu);

  return {
    1:  pos / sum,
    0:  Math.max(0, neu) / sum,
    "-1": neg / sum,
    score: clamped,
    count,
  };
}

// ── TF-IDF ─────────────────────────────────────────────────────
class TFIDF {
  constructor(maxFeatures = 500) { this.maxFeatures = maxFeatures; this.vocab = {}; this.idf = {}; }

  fit(corpus) {
    const df = {};
    corpus.forEach(doc => { new Set(doc).forEach(t => { df[t] = (df[t] || 0) + 1; }); });
    const N = corpus.length;
    Object.keys(df).forEach(t => { this.idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1; });
    // Garder seulement les features avec meilleur IDF (ni trop rares, ni trop communes)
    const scored = Object.entries(df)
      .filter(([, f]) => f >= 2 && f <= N * 0.9) // ignorer hapax et mots universels
      .map(([t, f]) => [t, this.idf[t] * Math.sqrt(f)]) // score = idf * sqrt(tf)
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.maxFeatures);
    scored.forEach(([t], i) => { this.vocab[t] = i; });
  }

  transform(tokens) {
    const tf = {};
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    const total = tokens.length || 1;
    const vec = new Array(Object.keys(this.vocab).length).fill(0);
    Object.entries(tf).forEach(([t, c]) => {
      if (this.vocab[t] !== undefined) {
        vec[this.vocab[t]] = (1 + Math.log(c)) / total * (this.idf[t] || 1); // log-TF
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
        this.logLikelihood[c][t] = Math.log(((tc[c][t] || 0) + this.alpha) / (total + this.alpha * this.vocabSize));
      });
    });
  }

  predictProba(tokens) {
    const scores = {};
    this.classes.forEach(c => {
      scores[c] = this.logPrior[c];
      tokens.forEach(t => { scores[c] += this.logLikelihood[c]?.[t] ?? Math.log(this.alpha / (this.alpha * (this.vocabSize||1))); });
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

// ── LOGISTIC REGRESSION (SGD) ──────────────────────────────────
class LogisticRegression {
  constructor(lr = 0.1, epochs = 200, lambda = 0.001) {
    this.lr = lr; this.epochs = epochs; this.lambda = lambda;
    this.models = {}; // One-vs-Rest
  }

  _sigmoid(x) { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
  _dot(a, b)   { return a.reduce((s, v, i) => s + v * (b[i] || 0), 0); }

  _trainBinary(X, y_bin) {
    const dim = X[0].length;
    let w = new Array(dim).fill(0).map(() => (Math.random() - 0.5) * 0.01);
    let b = 0;
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const lr_t = this.lr / (1 + 0.01 * epoch); // learning rate decay
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
    const p = {};
    [-1, 0, 1].forEach(c => { p[c] = scores[c] / sum; });
    return p;
  }
}

// ── DATASET 300+ EXEMPLES ──────────────────────────────────────
const TRAINING_DATA = [
  // POSITIFS FR (60)
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

  // NÉGATIFS FR (60)
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

  // NEUTRES FR (30)
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

  // POSITIFS EN (60)
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

  // NÉGATIFS EN (60)
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

  // NEUTRES EN (30)
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

  // CAS COMPLEXES (négations, intensificateurs)
  {text:"Pas du tout satisfait vraiment décevant",label:-1},
  {text:"Not at all what I expected very disappointing",label:-1},
  {text:"Tout à fait excellent vraiment impressionnant",label:1},
  {text:"Absolutely not recommended terrible quality",label:-1},
  {text:"Je ne suis pas content du tout de ce produit",label:-1},
  {text:"Bien meilleur que ce à quoi je m attendais",label:1},
  {text:"Much better than expected really surprised",label:1},
  {text:"Pas terrible mais convenable pour le prix",label:0},
  {text:"Not bad not great just average experience",label:0},
  {text:"Couldn't be happier with this amazing purchase",label:1},
  {text:"Could not be more disappointed terrible product",label:-1},
  {text:"Jamais vu une telle qualité vraiment impressionné",label:1},
  {text:"Never seen such poor quality extremely disappointed",label:-1},
  {text:"Pas exceptionnel mais correct pour le prix",label:0},
  {text:"Not exceptional but okay for the price",label:0},
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
  // 1. Shuffle et split AVANT tout entraînement
  const shuffled  = [...TRAINING_DATA].sort(() => Math.random() - 0.5);
  const splitIdx  = Math.floor(shuffled.length * 0.8);
  const trainSet  = shuffled.slice(0, splitIdx);   // 80% → entraînement
  const testSet   = shuffled.slice(splitIdx);       // 20% → évaluation uniquement

  // 2. Préparer les features sur trainSet SEULEMENT
  const X_tokens  = trainSet.map(d => preprocessText(d.text));
  const y         = trainSet.map(d => d.label);

  // 3. Fit TF-IDF sur trainSet SEULEMENT
  this.tfidf.fit(X_tokens);
  const X_vec = X_tokens.map(t => this.tfidf.transform(t));

  // 4. Entraîner les modèles sur trainSet SEULEMENT
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

    const tokens  = preprocessText(text);
    const vec     = this.tfidf.transform(tokens);
    const negInfo = detectNegation(text);

    // 3 votants
    const nbProba  = this.nb.predictProba(tokens);
    const lrProba  = this.lr.predictProba(vec);
    const lexProba = lexiconScore(text);

    // Poids adaptatifs : si lexique fort → lui donner plus de poids
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
    "colère":    ["furieux","énervé","angry","furious","outraged","horrible","awful","honteux"],
    "dégoût":    ["dégoûtant","nul","arnaque","scam","garbage","rubbish","terrible","inutilisable"],
    "tristesse": ["déçu","décevant","disappointed","sad","regret","regrette","mécontent"],
  };
  const lower = text.toLowerCase();
  const found = Object.entries(lex)
    .filter(([, words]) => words.some(w => lower.includes(w)))
    .map(([e]) => e);
  if (!found.length) return [pred===1?"satisfaction":pred===-1?"insatisfaction":"neutralité"];
  return found.slice(0, 3);
}

function detectLang(text) {
  const frWords = ["le","la","les","de","du","et","est","je","un","une","pas","très","produit","service","qualité","livraison","achat","satisfait","déçu","recommande"];
  const lower   = text.toLowerCase();
  return frWords.filter(w => lower.split(" ").includes(w)).length >= 2 ? "FR" : "EN";
}

// ── EXPORT ─────────────────────────────────────────────────────
const model = new EnsembleNLP();
model.train();
module.exports = model;