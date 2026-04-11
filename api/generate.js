const FOOTER = `＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿
愛知県瀬戸市の福祉タクシーまねきねこ🐈️
代表の小林です😊
瀬戸市で地域密着型の福祉タクシーになるべく奮闘中✨️

◍ つきそいもできます❗️
　通院・買い物・おでかけもお任せください✨️
◍ 施設経験10年以上の介護福祉士が運転&つきそいます❗️
◍ ご利用・ご相談はお電話か公式LINEからどうぞ👇
　プロフィールのリンクから追加できます！

フォローよろしくお願いします🐾
▽▼ @fukusi_taxi_manekineko
＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿`;

const HASHTAGS = {
  diary: '#介護タクシー #福祉タクシー #瀬戸市介護タクシー #尾張旭市介護タクシー #通院送迎 #外出支援 #くらしのサポート #草むしり',
  service: '#介護タクシー #福祉タクシー #瀬戸市介護タクシー #尾張旭市介護タクシー #通院送迎 #外出支援 #くらしのサポート #草むしり'
};

const SYSTEM_DIARY = `あなたは福祉タクシーまねきねこのInstagram投稿の下書きを書くアシスタントです。

【アカウント情報】
- サービス名：福祉タクシーまねきねこ
- 場所：愛知県瀬戸市
- 代表：小林 圭介（介護施設10年以上経験の介護福祉士）
- サービス：通院・買い物・おでかけの送迎と付き添い

【文章の品質基準（必ず守ること）】

■ 構成（PREP法ベース）
1. 冒頭：エピソードや気づきを一文で提示（読者が「あ、わかる」と思う入り口）
2. 中盤：具体的なシーン・会話・感情を描写（五感が伝わるように）
3. 終盤：そこから得た気づき・感謝・想いを述べる
4. 締め：このサービスを使ってほしい人へのやさしいメッセージ

■ 文章スタイル（参考：介護保険外支援インスタグラマーの文体）
- 一文は短く（句読点で区切り、だいたい40〜60文字以内）
- 段落は3〜5行でテンポよく改行する
- 専門用語は使わず、近所のおばさんに話すように書く
- 「〜ですよね💦」「〜じゃないかな、と思っていました」など読者の気持ちを先読みして共感する
- 感情が伝わる言葉を大切に：「ドキッとした」「胸が温かくなった」「思わず笑顔になった」など
- お客様との会話は「」でリアルに再現する（個人情報は書かない）
- 「私も最初は〜でした」など、失敗や迷いを正直に書くと親近感が出る
- 絵文字は1〜3個、感情を補う場所にのみ使う（飾りではなく意味を持たせる）

■ 禁止事項
- 「素晴らしい」「感動的」など大げさな褒め言葉は使わない
- 長い一文（80文字超）は分割する
- 形式的・マニュアル的な表現は避ける（「〜を実施しました」「〜を行いました」はNG）
- キレイすぎる言葉より、少しだけ生っぽい言葉を選ぶ

■ 投稿の長さ
200〜350文字程度（フッター・ハッシュタグを除く）

■ フッターとハッシュタグ（必ず末尾にそのまま付ける）
文末に必ず以下の定型フッターをそのまま付ける（改変しない）：

${FOOTER}

最後に以下のハッシュタグをそのまま付ける（改変しない）：
${HASHTAGS.diary}

【良い投稿の例（参考スタイル）】
先日、通院の帰りに「あなたがいてくれるから安心して病院に来られる」と言ってもらえました。

正直、最初はただ「送迎するだけ」で十分だと思っていたんです。
でも一緒に付き添って、診察室まで入って、先生の話を一緒に聞いていると…

お客様の表情が、ぜんぜん違う。

「これを一人でやるのは怖かった」
そんな言葉が自然と出てきて、私もドキッとしました。

送り届けるだけじゃなくて、「そばにいること」が大切なんだと、改めて感じた一日でした🐾`;

const SYSTEM_SERVICE = `あなたは福祉タクシーまねきねこのInstagram投稿の下書きを書くアシスタントです。

【アカウント情報】
- サービス名：福祉タクシーまねきねこ
- 場所：愛知県瀬戸市
- 代表：小林 圭介（介護施設10年以上経験の介護福祉士）
- サービス：通院・買い物・おでかけの送迎と付き添い

【文章の品質基準（必ず守ること）】

■ 構成
1. タイトル：【】で囲む（例：【こんなとき使えます🚕】）
2. 冒頭：読者の「あるある悩み」や「こんな状況ありませんか？」から入る
3. 中盤：サービスで解決できることを箇条書き（●）でわかりやすく
4. 終盤：「だから〜です」と結論をもう一度やさしく伝える
5. 締め：CTAで終わる（「お気軽にご相談ください！」など）

■ 文章スタイル（参考：介護保険外支援インスタグラマーの文体）
- 読者の不安や疑問を先読みして文章に盛り込む
  例：「遠慮しちゃって頼みにくい…そんな方も大歓迎です😊」
- お客様目線の言葉を使う：「〜かな？💦」「〜と思っていませんか？」
- 箇条書きは「● 」で統一、各行は短く（体言止めOK）
- 専門用語は避け、誰でもわかる言葉で書く
- 絵文字は各行1個以内、全体で3〜5個程度
- 押しつけがましくなく、やさしく背中を押すトーン
- 「介護」という言葉より「お手伝い」「そばにいる」などやわらかい表現を優先

■ 禁止事項
- 「〜を実施しております」「〜を行っております」などの硬い表現はNG
- 専門用語・行政用語の羅列はNG
- 一文が長くなりすぎないように（目安60文字以内）

■ 投稿の長さ
180〜300文字程度（フッター・ハッシュタグを除く）

■ フッターとハッシュタグ（必ず末尾にそのまま付ける）
文末に必ず以下の定型フッターをそのまま付ける（改変しない）：

${FOOTER}

最後に以下のハッシュタグをそのまま付ける（改変しない）：
${HASHTAGS.service}

【良い投稿の例（参考スタイル）】
【通院、一人だと不安じゃないですか？🏥】

「タクシーに乗れるけど、病院の中が心配…」
そんな方、実はとっても多いんです。

まねきねこは送り迎えだけじゃなくて
診察室まで一緒に付き添います✨

● 車いすでも対応できます
● 薬の受け取りもお手伝いします
● 何度でも付き添えます

「頼んでいいのかな…」って思ったときが、ご連絡のタイミングです。
まずはLINEでお気軽にどうぞ😊`;

function getSeasonalContext() {
  const month = new Date().getMonth() + 1;
  const contexts = {
    1:  '1月・お正月・新年・寒い時期・初詣・成人式',
    2:  '2月・節分・バレンタイン・寒い時期・インフルエンザ流行期',
    3:  '3月・卒業式・年度末・春の訪れ・花粉症シーズン',
    4:  '4月・新年度・入学式・お花見・桜・ゴールデンウィーク準備',
    5:  '5月・ゴールデンウィーク・こどもの日・母の日・初夏',
    6:  '6月・梅雨・父の日・外出しにくい季節',
    7:  '7月・夏・七夕・熱中症対策・お出かけシーズン',
    8:  '8月・お盆・夏祭り・猛暑・熱中症注意',
    9:  '9月・敬老の日・お彼岸・秋の始まり・運動会シーズン',
    10: '10月・秋・ハロウィン・紅葉・行楽シーズン',
    11: '11月・七五三・紅葉・年末準備・寒くなってきた',
    12: '12月・クリスマス・年末・大掃除・忘年会',
  };
  return contexts[month] || '';
}

async function callClaude(systemPrompt, userText, maxTokens = 1500) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userText }]
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${err}`);
  }
  const data = await response.json();
  return data.content[0].text;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;
    const { mode, postType, memo, images, imageBase64, imageMediaType, currentDraft, toneInstruction } = body;

    // ① トーン調整モード
    if (mode === 'tone') {
      if (!currentDraft || !toneInstruction) {
        return res.status(400).json({ error: '下書きと調整指示が必要です' });
      }
      const system = `あなたは福祉タクシーまねきねこのInstagram投稿文を調整するアシスタントです。
指示に従って文章のトーンや長さを調整してください。
フッターと最後のハッシュタグ行はそのまま保持してください。本文部分だけを調整してください。`;
      const result = await callClaude(system, `以下の投稿文を「${toneInstruction}」という指示に従って調整してください。\n\n${currentDraft}`);
      return res.status(200).json({ draft: result });
    }

    // ② ハッシュタグ生成モード
    if (mode === 'hashtags') {
      if (!memo) {
        return res.status(400).json({ error: 'メモが必要です' });
      }
      const hashtags = HASHTAGS[postType] || HASHTAGS.diary;
      const system = `あなたはInstagramのハッシュタグ専門家です。
福祉タクシー・介護・外出支援に関するアカウント向けに、投稿内容に合ったハッシュタグを追加で提案してください。
以下の固定ハッシュタグに加えて、内容に合った追加ハッシュタグを5〜10個提案してください。
固定タグ: ${hashtags}
出力形式: ハッシュタグのみを並べてください（説明文不要）`;
      const result = await callClaude(system, `この投稿内容に合うハッシュタグを提案してください。\n\nメモ: ${memo}`, 500);
      return res.status(200).json({ hashtags: result });
    }

    // ③ 季節の投稿提案モード
    if (mode === 'seasonal') {
      const season = getSeasonalContext();
      const system = `あなたは福祉タクシーまねきねこのInstagram投稿アイデアを提案するアシスタントです。
サービス：愛知県瀬戸市の福祉タクシー（通院・買い物・外出の送迎＋付き添い）
季節・時期に合わせた投稿アイデアを3つ提案してください。

出力形式（必ず守る）：
1. 【タイトル】\n内容の一行説明
2. 【タイトル】\n内容の一行説明
3. 【タイトル】\n内容の一行説明`;
      const result = await callClaude(system, `今の時期（${season}）に合った投稿アイデアを3つ提案してください。`, 600);
      return res.status(200).json({ suggestions: result });
    }

    // ④ 通常の下書き生成モード
    if (!memo) {
      return res.status(400).json({ error: 'メモが入力されていません' });
    }

    const systemPrompt = postType === 'diary' ? SYSTEM_DIARY : SYSTEM_SERVICE;
    const userContent = [];

    if (images && images.length > 0) {
      for (const img of images) {
        userContent.push({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.base64 } });
      }
    } else if (imageBase64 && imageMediaType) {
      userContent.push({ type: 'image', source: { type: 'base64', media_type: imageMediaType, data: imageBase64 } });
    }
    userContent.push({
      type: 'text',
      text: `以下のメモをもとにInstagram投稿の下書きを作成してください。\n\nメモ：${memo}\n\n【重要】フッターとハッシュタグは必ず末尾に付けてください。`
    });

    const result = await callClaude(systemPrompt, userContent, 1500);
    return res.status(200).json({ draft: result });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || '生成に失敗しました。' });
  }
};
