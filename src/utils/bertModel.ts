export interface BertTokenizerConfig {
  vocabSize: number;
  maxLength: number;
  padTokenId: number;
  maskTokenId: number;
  sepTokenId: number;
  clsTokenId: number;
}

export interface TokenIds {
  input_ids: number[];
  token_type_ids: number[];
  attention_mask: number[];
}

export interface BertEmbedding {
  embedding: number[];
  tokenId: number;
  token: string;
}

export interface SentimentPrediction {
  positive: number;
  negative: number;
  neutral: number;
  predicted_class: 'positive' | 'negative' | 'neutral';
  confidence: number;
  raw_logits: number[];
}

export class BertTokenizer {
  private vocab: Map<string, number>;
  private inverseVocab: Map<number, string>;
  private config: BertTokenizerConfig;

  constructor(vocabSize: number = 30522) {
    this.config = {
      vocabSize,
      maxLength: 512,
      padTokenId: 0,
      maskTokenId: 103,
      sepTokenId: 102,
      clsTokenId: 101
    };

    this.vocab = new Map();
    this.inverseVocab = new Map();
    this.initializeVocab();
  }

  private initializeVocab(): void {
    const commonTokens = [
      '[PAD]', '[unused0]', '[unused1]', '[unused2]', '[unused3]',
      '[UNK]', '[CLS]', '[SEP]', '[MASK]', '!', '"', '#', '$', '%',
      'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'it',
      'that', 'this', 'for', 'from', 'with', 'by', 'on', 'at', 'as',
      'was', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'product', 'review', 'good', 'bad', 'great', 'terrible',
      'amazing', 'awful', 'love', 'hate', 'quality', 'price', 'delivery',
      'excellent', 'poor', 'recommend', 'waste', 'money', 'worth', 'value'
    ];

    commonTokens.forEach((token, idx) => {
      this.vocab.set(token, idx);
      this.inverseVocab.set(idx, token);
    });

    for (let i = commonTokens.length; i < this.config.vocabSize; i++) {
      this.inverseVocab.set(i, `[unused${i}]`);
    }
  }

  encode(text: string): TokenIds {
    const tokens = this.tokenize(text);
    const truncated = tokens.slice(0, this.config.maxLength - 2);

    const input_ids: number[] = [this.config.clsTokenId];
    for (const token of truncated) {
      input_ids.push(this.getTokenId(token));
    }
    input_ids.push(this.config.sepTokenId);

    const attention_mask = new Array(input_ids.length).fill(1);
    const token_type_ids = new Array(input_ids.length).fill(0);

    if (input_ids.length < this.config.maxLength) {
      const padLength = this.config.maxLength - input_ids.length;
      input_ids.push(...new Array(padLength).fill(this.config.padTokenId));
      attention_mask.push(...new Array(padLength).fill(0));
      token_type_ids.push(...new Array(padLength).fill(0));
    }

    return {
      input_ids: input_ids.slice(0, this.config.maxLength),
      attention_mask: attention_mask.slice(0, this.config.maxLength),
      token_type_ids: token_type_ids.slice(0, this.config.maxLength)
    };
  }

  private tokenize(text: string): string[] {
    text = text.toLowerCase();
    text = text.replace(/[^\w\s]/g, ' ');

    const tokens: string[] = [];
    const words = text.split(/\s+/);

    for (const word of words) {
      if (word.length === 0) continue;

      let remaining = word;
      const maxSubwordLength = 4;

      while (remaining.length > 0) {
        let found = false;

        for (let i = Math.min(maxSubwordLength, remaining.length); i > 0; i--) {
          const subword = remaining.substring(0, i);
          if (this.vocab.has(subword) || this.canBeTokenized(subword)) {
            tokens.push(subword);
            remaining = remaining.substring(i);
            found = true;
            break;
          }
        }

        if (!found) {
          tokens.push(remaining.substring(0, 1));
          remaining = remaining.substring(1);
        }
      }
    }

    return tokens;
  }

  private canBeTokenized(subword: string): boolean {
    return subword.length > 0 && /[a-z0-9]/.test(subword);
  }

  private getTokenId(token: string): number {
    return this.vocab.get(token) || this.vocab.get('[UNK]') || 100;
  }

  decode(token_ids: number[]): string {
    return token_ids
      .map(id => this.inverseVocab.get(id) || '[UNK]')
      .join(' ')
      .replace(/\[unused\d+\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export class SimpleBertModel {
  private tokenizer: BertTokenizer;
  private sentimentWeights: number[] = [];

  constructor() {
    this.tokenizer = new BertTokenizer();
    this.initializeWeights();
  }

  private initializeWeights(): void {
    const sentimentTokens = ['good', 'great', 'amazing', 'excellent', 'love', 'best', 'perfect'];
    const negativeTokens = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'waste'];

    this.sentimentWeights = sentimentTokens.map(() => 0.8);
    this.sentimentWeights.push(...negativeTokens.map(() => -0.8));
  }

  predict(text: string): SentimentPrediction {
    const encoded = this.tokenizer.encode(text);

    const logits = this.computeLogits(encoded, text);

    const softmax = this.applySoftmax(logits);

    const predicted_class = this.getClass(softmax);
    const confidence = Math.max(...softmax) * 100;

    return {
      positive: softmax[0],
      negative: softmax[1],
      neutral: softmax[2],
      predicted_class,
      confidence,
      raw_logits: logits
    };
  }

  private computeLogits(encoded: TokenIds, originalText: string): number[] {
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    const lowerText = originalText.toLowerCase();
    const words = lowerText.split(/\s+/);

    const positiveWords = ['good', 'great', 'amazing', 'excellent', 'love', 'best', 'perfect', 'wonderful', 'fantastic', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'waste', 'horrible', 'disgusting', 'broken'];

    for (const word of words) {
      if (positiveWords.some(pw => word.includes(pw))) {
        positiveScore += 1.5;
      }
      if (negativeWords.some(nw => word.includes(nw))) {
        negativeScore += 1.5;
      }
    }

    const exclamationBoost = (originalText.match(/!/g) || []).length * 0.3;
    const questionPenalty = (originalText.match(/\?/g) || []).length * 0.2;

    positiveScore += exclamationBoost;
    negativeScore += questionPenalty;

    const attention = encoded.attention_mask;
    const tokenCount = attention.filter(a => a === 1).length;
    neutralScore = Math.log(tokenCount / 10);

    return [positiveScore, negativeScore, neutralScore];
  }

  private applySoftmax(logits: number[]): number[] {
    const maxLogit = Math.max(...logits);
    const exps = logits.map(l => Math.exp(l - maxLogit));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }

  private getClass(softmax: number[]): 'positive' | 'negative' | 'neutral' {
    const maxIdx = softmax.indexOf(Math.max(...softmax));
    if (maxIdx === 0) return 'positive';
    if (maxIdx === 1) return 'negative';
    return 'neutral';
  }
}

export const createBertModel = (): SimpleBertModel => {
  return new SimpleBertModel();
};

export const analyzeWithBert = (text: string, model: SimpleBertModel): SentimentPrediction => {
  return model.predict(text);
};
