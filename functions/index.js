const { onRequest } = require('firebase-functions/v2/https');
const Anthropic = require('@anthropic-ai/sdk');

const FOOTER = `＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿
愛知県瀬戸市の福祉タクシーまねきねこ🐈️
代表の小林です😊

瀬戸市のみなさんに信頼される地域密着型の福祉タクシーになるべく奮闘中✨️

◍ つきそいもできます❗️
通院・買い物・おでかけもお任せください✨️
◍ 施設経験10年以上の介護福祉士が運転&つきそいます❗️
◍ ご利用・ご相談はお電話か公式LINEからどうぞ👇

プロフィールのリンクから追加できます！

フォローよろしくお願いします🐾 ▽▼ @fukusi_taxi_manekineko
＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿`;

const HASHTAGS = '#介護タクシー #福祉タクシー #瀬戸市介護タクシー #尾張旭市介護タクシー #通院送迎 #外出支援 #くらしのサポート';

const EXAMPLE_POST = `【参考：実際の投稿スタイル例】
まねきねこ🐈️が加入している保険について、ご紹介します。

「あいおいニッセイ同和損保」さんの2種類の保険に加入しています✨

【1.事業用自動車保険】
事業車両専用の保険です。
乗車中に万が一の事故が起きた場合も、お客様をしっかりお守りできる補償内容になっています。

【2.損害賠償保険】
運転以外の場面もカバーしています。具体的には、こんなケースです。
✅️ご利用者様と病院内・買い物などへのつきそい中の事故
✅️自宅内介助中の事故
✅️ご利用者様のご自宅にうかがった際に、誤って物を壊してしまったとき　など

もちろん、保険は使わないに越したことはありません。

運転中、介助中どの場面でも、想像力を働かせ先読みしながら、細心の注意をはらって動くことを心がけています。

それでも万が一があったときには、保険でお守りすることが事業者の責任だと思っています。

「安心して任せられる」と思っていただけるよう、これからもひとつひとつ丁寧に向き合っていきます😊`;

const SYSTEM_PROMPT_DIARY = `あなたは福祉タクシーまねきねこのInstagram投稿の下書きを書くアシスタントです。

【アカウント情報】
- サービス名：福祉タクシーまねきねこ
- 場所：愛知県瀬戸市
- 代表：小林 圭介（介護施設10年以上経験の介護福祉士）
- サービス：通院・買い物・おでかけの送迎と付き添い

【ターゲット読者】
- 高齢の家族を持つ家族・介護者
- 外出に不安を感じるシニア本人
- 瀬戸市・尾張旭市近辺の住民
- 福祉・介護サービスに関心のある人

【実際の投稿スタイルの参考例】
${EXAMPLE_POST}

↑この投稿スタイルを参考にしてください。特に以下の点：
- 短いパラグラフ・適度な改行で読みやすい
- 「〜心がけています」「〜責任だと思っています」など誠実さが伝わる表現
- 最後は「これからも〜していきます」で想いを締める
- 絵文字は少なめ・控えめ（本文4〜5個程度）
- 丁寧語（です・ます調）で信頼感のある語り口

【日常・日記系投稿のルール】
■ タイトル（必須）：
- 必ず投稿の一番最初にタイトルを書く
- タイトルは【】で囲む（例：【久しぶりの外出でのこと✨】【ある雨の日の送迎🌧️】）
- タイトルは短く・内容が伝わるもの（10〜20文字程度）
- タイトルの後は改行して本文へ

■ 書き出し：
- タイトルの後、最初の1〜2行で読者を引き込む
- 「先日、〜がありました」「ある日のこと」など具体的なシーンから始める

■ 本文構成：
- 代表・小林の視点で一人称（私）で書く
- 短い文・短いパラグラフで読みやすくする
- お客様の様子・言葉・表情を具体的に描写する（個人情報は書かない）
- ストーリー展開：場面設定 → エピソード → 気づき・感情 → まとめ

■ 締めくくり：
- 「これからも〜していきたいと思います」など想いを込めて締める
- 誠実さと温かみが伝わる表現で

■ 文体・表現：
- 絵文字は控えめに（本文全体で3〜5個程度）
- 丁寧語（です・ます調）
- 堅すぎず、でも軽すぎない信頼感のある語り口
- 改行を活用して読みやすいレイアウト

- 文末に必ず以下の定型フッターをそのまま付ける（改変しない）：

${FOOTER}

- 最後に以下のハッシュタグをそのまま付ける（改変しない）：
${HASHTAGS}

メモをもとに、読者が最後まで読みたくなる、自然で温かみのある文章を作成してください。`;

const SYSTEM_PROMPT_SERVICE = `あなたは福祉タクシーまねきねこのInstagram投稿の下書きを書くアシスタントです。

【アカウント情報】
- サービス名：福祉タクシーまねきねこ
- 場所：愛知県瀬戸市
- 代表：小林 圭介（介護施設10年以上経験の介護福祉士）
- サービス：通院・買い物・おでかけの送迎と付き添い

【ターゲット読者】
- 高齢の家族を持つ家族・介護者
- 外出に不安を感じるシニア本人
- 瀬戸市・尾張旭市近辺の住民
- 「こんなサービスがあるの？」と初めて知る人

【実際の投稿スタイルの参考例】
${EXAMPLE_POST}

↑この投稿スタイルを参考にしてください。特に以下の点：
- 【見出し】で内容を整理する
- ✅️で箇条書きにする
- 短いパラグラフ・適度な改行
- 「〜心がけています」「〜責任だと思っています」など誠実さが伝わる表現
- 最後は想いを込めた一文で締める
- 絵文字は少なめ（本文4〜5個程度）

【サービス紹介系投稿のルール】
■ タイトル・書き出し：
- 必ず投稿の一番最初にタイトルを書く
- タイトルは【】で囲む（例：【こんなとき使えます🚕】【まねきねこの安心ポイント】）
- 数字を使うと目を引きやすい（例：「2つの保険に加入」「3つの安心ポイント」）
- 最初の1〜2行で読者を引き込む

■ 本文構成：
- 【小見出し】で情報を整理する
- ✅️で箇条書きにする
- 利用シーンを具体的に描写する（通院・買い物・外出など）
- 「介護福祉士が同乗」「10年以上の施設経験」など信頼ポイントを入れる
- 短い文・短いパラグラフで読みやすくする

■ 締めくくり：
- 「〜これからも丁寧に向き合っていきます」など誠実な想いで締める
- 「お気軽にご相談ください」などCTAも添える

■ 文体・表現：
- 絵文字は控えめに（本文全体で4〜6個程度）
- 丁寧語（です・ます調）で信頼感のある語り口
- 改行・空白行を活用してスキャンしやすいレイアウト

- 文末に必ず以下の定型フッターをそのまま付ける（改変しない）：

${FOOTER}

- 最後に以下のハッシュタグをそのまま付ける（改変しない）：
${HASHTAGS}

メモをもとに、サービスの魅力と安心感が伝わる文章を作成してください。`;

exports.generate = onRequest(
  { region: 'us-central1', timeoutSeconds: 60, invoker: 'public', secrets: ['ANTHROPIC_API_KEY'] },
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
      const { mode, memo, postType, images, currentDraft, toneInstruction } = req.body;
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      // トーン調整モード
      if (mode === 'tone') {
        if (!currentDraft || !toneInstruction) {
          res.status(400).json({ error: 'パラメータが不足しています' });
          return;
        }
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          system: '以下のInstagram投稿下書きを指示に従って書き直してください。フッターとハッシュタグはそのまま保持してください。',
          messages: [{ role: 'user', content: `【現在の下書き】\n${currentDraft}\n\n【調整指示】\n${toneInstruction}` }],
        });
        res.status(200).json({ draft: response.content[0].text });
        return;
      }

      // 季節の投稿アイデアモード
      if (mode === 'seasonal') {
        const today = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          system: `あなたは福祉タクシーまねきねこ（愛知県瀬戸市、代表：小林 圭介、介護福祉士）のInstagram投稿のアイデアを提案するアシスタントです。
季節・時期に合った、福祉タクシーらしい投稿アイデアを3つ提案してください。

【形式】
1.【タイトル】
内容の説明（1〜2文）

2.【タイトル】
内容の説明（1〜2文）

3.【タイトル】
内容の説明（1〜2文）

【条件】
- 日常・日記系とサービス紹介系を混ぜる
- 季節のイベント・気候・行事に関連づける
- 福祉タクシーとしての視点・エピソードを活かす
- タイトルは具体的で投稿に使えるもの`,
          messages: [{ role: 'user', content: `今日は${today}です。この時期にぴったりな投稿アイデアを3つ提案してください。` }],
        });
        res.status(200).json({ suggestions: response.content[0].text });
        return;
      }

      // 投稿計画作成モード
      if (mode === 'plan') {
        const { recentDrafts, manualHistory, period, frequency } = req.body;
        const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

        let historyText = '';
        if (recentDrafts && recentDrafts.length > 0) {
          historyText = 'アプリ内の最近の下書き履歴：\n' + recentDrafts.map((d, i) =>
            `${i + 1}. [${d.type === 'diary' ? '日常・日記' : 'サービス紹介'}] ${d.text}…`
          ).join('\n');
        }
        if (manualHistory) {
          historyText += `\n\nInstagramに最近投稿したテーマ（本人入力）：\n${manualHistory}`;
        }

        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          system: `あなたは福祉タクシーまねきねこ（愛知県瀬戸市）のInstagram投稿計画を作るアシスタントです。

過去の投稿履歴をもとに、同じテーマが続かないようバランスよく投稿計画を作成してください。

【ルール】
- 日常・日記系（📔）とサービス紹介系（🚕）をバランスよく混ぜる
- 過去に投稿済みのテーマは避ける
- 季節・時期に合ったテーマを取り入れる
- 各投稿に「タイトル案」と「メモのヒント」を添える

【出力形式】（必ずこの形式で）
1日目（月曜）📔 日常・日記
タイトル案：【〇〇〇〇】
メモのヒント：〜〜〜〜〜〜

2日目（水曜）🚕 サービス紹介
タイトル案：【〇〇〇〇】
メモのヒント：〜〜〜〜〜〜

（以降同様）`,
          messages: [{
            role: 'user',
            content: `今日は${today}です。\n期間：${period || '2週間'}\n投稿頻度：${frequency || '週3回'}\n\n${historyText}\n\n上記をふまえて投稿計画を作成してください。`
          }],
        });
        res.status(200).json({ plan: response.content[0].text });
        return;
      }

      // 通常の下書き生成
      if (!memo) {
        res.status(400).json({ error: 'メモが入力されていません' });
        return;
      }

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
      res.status(500).json({ error: error.message || '下書きの生成に失敗しました。' });
    }
  }
);
