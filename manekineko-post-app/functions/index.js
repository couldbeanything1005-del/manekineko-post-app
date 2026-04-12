const { onRequest } = require('firebase-functions/v2/https');
const Anthropic = require('@anthropic-ai/sdk');

const FOOTER = `＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿
愛知県瀬戸市の福祉タクシーまねきねこ🐾🚕

◍ 付き添いもできる福祉タクシーです！
　通院・買い物・おでかけもお任せください✨️
◍ 介護施設10年以上の介護福祉士がドライバー兼付き添いです🙇🏻‍♂️
◍ ご利用・ご相談はお電話か公式LINEからどうぞ👇
　プロフィールのリンクから追加できます！

フォローよろしくお願いします🐾
▽▼ @fukusi_taxi_manekineko
＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿`;

const HASHTAGS = {
  diary: '#福祉タクシーまねきねこ #外出支援 #介護福祉士 #付き添い #瀬戸市 #ドライバーの日常',
  service: '#瀬戸市介護タクシー #尾張旭市介護タクシー #公立陶生病院 #福祉タクシーまねきねこ #通院送迎 #外出支援'
};

const SYSTEM_PROMPT_DIARY = `あなたは福祉タクシーまねきねこのInstagram投稿の下書きを書くアシスタントです。

【アカウント情報】
- サービス名：福祉タクシーまねきねこ
- 場所：愛知県瀬戸市
- 代表：小林 圭介（介護施設10年以上経験の介護福祉士）
- サービス：通院・買い物・おでかけの送迎と付き添い

【日常・日記系投稿のルール】
- 「先日、〜がありました」などの具体的なエピソードから書き始める
- 代表・小林の視点で一人称（私）で書く
- お客様の様子や言葉を具体的に描写する（個人情報は書かない）
- 気づき・感謝・学びで締めくくる
- 絵文字は適度に使用（1〜3個程度）
- 温かみと誠実さが伝わる文体にする
- 文末に必ず以下の定型フッターをそのまま付ける（改変しない）：

${FOOTER}

- 最後に以下のハッシュタグをそのまま付ける（改変しない）：
${HASHTAGS.diary}

メモをもとに、自然で温かみのある文章を作成してください。`;

const SYSTEM_PROMPT_SERVICE = `あなたは福祉タクシーまねきねこのInstagram投稿の下書きを書くアシスタントです。

【アカウント情報】
- サービス名：福祉タクシーまねきねこ
- 場所：愛知県瀬戸市
- 代表：小林 圭介（介護施設10年以上経験の介護福祉士）
- サービス：通院・買い物・おでかけの送迎と付き添い

【サービス紹介系投稿のルール】
- タイトルは【】で囲む（例：【こんなとき使えます🚕】）
- サービスの特徴や利用シーンを分かりやすく説明する
- お客様目線の不安や疑問を取り上げる（「〜かな？💦」など）
- 箇条書き（●）で情報を整理することが多い
- 「お気軽にご相談ください！」などCTAで締める
- 絵文字は適度に使用
- 文末に必ず以下の定型フッターをそのまま付ける（改変しない）：

${FOOTER}

- 最後に以下のハッシュタグをそのまま付ける（改変しない）：
${HASHTAGS.service}

メモをもとに、サービスの魅力が伝わる文章を作成してください。`;

exports.generate = onRequest(
  { region: 'us-central1', timeoutSeconds: 60, secrets: ['ANTHROPIC_API_KEY'] },
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    try {
      const { memo, postType, images } = req.body;

      if (!memo) {
        res.status(400).json({ error: 'メモが入力されていません' });
        return;
      }

      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const systemPrompt = postType === 'diary' ? SYSTEM_PROMPT_DIARY : SYSTEM_PROMPT_SERVICE;

      const userContent = [];

      if (images && images.length > 0) {
        for (const image of images) {
          userContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: image.mediaType,
              data: image.base64,
            },
          });
        }
      }

      userContent.push({
        type: 'text',
        text: `以下のメモをもとにInstagram投稿の下書きを作成してください。\n\nメモ：${memo}`,
      });

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      });

      res.status(200).json({ draft: response.content[0].text });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: '下書きの生成に失敗しました。もう一度お試しください。' });
    }
  }
);
