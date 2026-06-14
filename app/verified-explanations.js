(function applyVerifiedExplanations() {
  window.COMMON_QUESTION_BANK = window.COMMON_QUESTION_BANK || {};
  if (window.QUESTIONS) window.COMMON_QUESTION_BANK[2025] = window.QUESTIONS;
  const bank = window.COMMON_QUESTION_BANK?.[2021];
  if (!bank) return;

  function apply(number, statements) {
    const question = bank.find(item => item.number === number);
    if (!question) return;
    question.reviewStatus = "text-verified";
    question.verificationStatus = "text-verified";
    statements.forEach((statement, index) => Object.assign(question.statements[index], { verificationStatus: "text-verified", ...statement }));
    if (window.SOURCE_MAPPING?.[`common-2021-${number}`]) {
      window.SOURCE_MAPPING[`common-2021-${number}`].status = "text-verified";
    }
  }

  apply(4, [
    {
      explanation: "誤りです。安全管理規程は国土交通大臣の認可を受けるのではなく、国土交通大臣へ届け出ます。変更時も同様です。",
      errorPoint: "「認可を受ける」が誤りで、正しくは「届け出る」です。",
      derivation: ["手続を表す「認可」と「届出」を区別する。", "第18条の3第1項は、安全管理規程を定めた後の手続を届出と規定している。", "したがって認可制とした記述は誤りとなる。"],
      citation: "鉄道事業法 第18条の3第1項",
      statuteText: "鉄道事業者は安全管理規程を定め、国土交通省令で定めるところにより国土交通大臣へ届け出なければならない。変更時も同様である。"
    },
    {
      explanation: "正しい記述です。鉄道事業者には、安全管理規程に基づいて安全統括管理者と運転管理者を選任する義務があります。第三種鉄道事業者は安全統括管理者が対象です。",
      errorPoint: "選任対象と第三種鉄道事業者に関する括弧書きまで法令の規定と一致します。",
      citation: "鉄道事業法 第18条の3第4項",
      statuteText: "鉄道事業者は、安全管理規程に基づき、安全統括管理者及び運転管理者を選任しなければならない。第三種鉄道事業者は安全統括管理者を選任する。"
    },
    {
      explanation: "正しい記述です。安全管理規程の記載事項として、輸送の安全に関する情報の伝達及び共有が明示されています。",
      errorPoint: "「情報の伝達及び共有」は施行規則に列挙された記載事項です。",
      citation: "鉄道事業法施行規則 第36条の3第3号イ",
      statuteText: "安全管理規程には、輸送の安全に関する情報の伝達及び共有に関する事項を記載する。"
    },
    {
      explanation: "誤りです。安全報告書の公表期限は、毎事業年度の終了後1年以内ではなく6か月以内です。",
      errorPoint: "「1年以内」が誤りで、正しくは「6か月以内」です。",
      derivation: ["期限の数値に着目する。", "第36条の9第1項は毎事業年度の終了後6か月以内の公表を求めている。", "問題文の1年は法定期限と一致しない。"],
      citation: "鉄道事業法施行規則 第36条の9第1項",
      statuteText: "鉄道事業者は、毎事業年度の終了後6か月以内に、輸送の安全に関する情報を記載した安全報告書を公表しなければならない。"
    }
  ]);

  apply(5, [
    {
      explanation: "誤りです。振替輸送は、第37条の5が列挙する乗継ぎ又は貨物引継ぎを円滑にする措置には含まれていません。",
      errorPoint: "「振替輸送」は列挙項目ではありません。",
      citation: "鉄道事業法施行規則 第37条の5",
      statuteText: "同条は、直通運転、同一プラットホームでの対面接続、改札口の新設、貨物駅の配線変更、共通乗車券等を措置として列挙している。"
    },
    {
      explanation: "誤りです。条文が掲げる設備は「旅客用乗降口」ではなく「改札口」です。",
      errorPoint: "「旅客用乗降口の新設」が誤りで、正しくは「改札口の新設」です。",
      citation: "鉄道事業法施行規則 第37条の5第2号",
      statuteText: "旅客の乗継ぎを円滑にするため、改札口の新設その他の鉄道施設の建設又は改良を行うことが掲げられている。"
    },
    {
      explanation: "正しい項目です。貨物利用運送事業者等との貨物引継ぎを円滑にするため、貨物駅における鉄道線路の配線変更が列挙されています。",
      errorPoint: "対象が貨物の引継ぎ、措置が貨物駅の配線変更であり、条文と一致します。",
      citation: "鉄道事業法施行規則 第37条の5第3号",
      statuteText: "貨物の引継ぎを円滑にするため、貨物駅における鉄道線路の配線変更等を行うことが掲げられている。"
    },
    {
      explanation: "正しい項目です。同一プラットホームにおいて対面で接続することは、旅客の乗継ぎを円滑にする措置に含まれます。",
      errorPoint: "同一プラットホームでの対面接続は第1号に明示されています。",
      citation: "鉄道事業法施行規則 第37条の5第1号",
      statuteText: "他の鉄道事業者との間の直通運転又は同一のプラットホームでの対面による接続を行うことが掲げられている。"
    }
  ]);

  apply(8, [
    {
      explanation: "正答はアの「列車脱線」です。鉄道運転事故の種類は報告規則第3条に列挙されています。",
      derivation: ["空欄は鉄道運転事故の法定分類を求めている。", "第3条の列挙は列車衝突事故、列車脱線事故、列車火災事故と続く。", "よって列車脱線となる。"],
      terms: [{ term: "列車脱線事故", meaning: "列車が脱線した事故。報告規則上の鉄道運転事故に含まれる。" }, { term: "その他の選択肢", meaning: "この条文の鉄道運転事故の列挙語として空欄には入らない。" }],
      citation: "鉄道事故等報告規則 第3条第1項第2号",
      statuteText: "鉄道運転事故の種類として、第1号に列車衝突事故、第2号に列車脱線事故、第3号に列車火災事故が定められている。"
    },
    {
      explanation: "正答はオの「地方運輸局長」です。輸送障害の速報先及び報告書の提出先として規定されています。",
      citation: "鉄道事故等報告規則 第5条第2項",
      statuteText: "対象となる輸送障害が発生したときは、その旨を地方運輸局長に速報しなければならない。"
    },
    {
      explanation: "正答はエの「3時間」です。本線における運転を3時間以上支障すると認められる輸送障害が速報対象です。",
      errorPoint: "時間基準は3時間以上です。",
      derivation: ["第5条第2項第1号の数値基準を確認する。", "速報対象は本線の運転を3時間以上支障すると認められるもの。", "よって3時間となる。"],
      citation: "鉄道事故等報告規則 第5条第2項第1号",
      statuteText: "本線における運転を3時間以上支障すると認められる輸送障害は速報対象となる。"
    },
    {
      explanation: "正答はウの「2週間」です。特に異例と認められる輸送障害の報告書は、発生日から2週間以内に提出します。",
      errorPoint: "提出期限は発生日から2週間以内です。",
      derivation: ["異例な輸送障害に関する報告期限を確認する。", "発生日から2週間以内の提出が必要である。", "よって2週間となる。"],
      citation: "鉄道事故等報告規則 第5条第2項第2号",
      statuteText: "特に異例と認められる輸送障害は、発生の日から2週間以内に報告書を地方運輸局長へ提出する。"
    }
  ]);

  const specialistQuestion = window.SPECIALIST1_QUESTION_BANK?.[2024]?.find(item => item.number === 1);
  if (specialistQuestion) {
    specialistQuestion.reviewStatus = "solution-verified";
    specialistQuestion.verificationStatus = "solution-verified";
    specialistQuestion.diagram = `<figure><img src="assets/specialist1/2024/q01-circuits.png" alt="2024年度専門試験I問1の直流回路。図1は端子ef間が開放、図2は端子ef間に可変抵抗Rfを接続"><figcaption class="diagram-caption">2024年度専門試験I 問1 図1・図2（公式試験PDFから図版部分を抽出）</figcaption></figure>`;
    const updates = [
      {
        explanation: "正答はイの1 Aです。端子ef間は開放なので、図1のa-c間は2 Ωの枝と、a-b-cを通る3 Ωの枝の並列回路として扱います。",
        derivation: ["a-c間の合成抵抗は 2×3÷(2+3)=1.2 Ω。", "これにc-d間の2 Ωが直列なので、回路全体は1.2+2=3.2 Ω。", "オームの法則より I=3.2 V÷3.2 Ω=1 A。"],
        citation: "オームの法則、直列・並列抵抗の合成（2024年度専門試験I 問1 図1）",
        statuteText: "並列抵抗は R=R1R2/(R1+R2)、回路電流は I=V/R で求める。"
      },
      {
        explanation: "正答はアの0.4 Aです。全電流1 Aがc-d間の2 Ωを流れるため、a-c間の電圧を求め、3 Ω枝の電流を計算します。",
        derivation: ["c-d間の電圧降下は 1 A×2 Ω=2 V。", "電源3.2 Vから差し引くと、a-c間は3.2-2=1.2 V。", "a-b-c枝は1+2=3 Ωなので、I1=1.2 V÷3 Ω=0.4 A。"],
        citation: "キルヒホッフの電圧則、オームの法則（2024年度専門試験I 問1 図1）",
        statuteText: "閉回路の電圧降下の総和は電源電圧に等しく、枝電流は枝の両端電圧を抵抗で除して求める。"
      },
      {
        explanation: "正答はウの0.8 Vです。端子bc間の電圧は、bc間の2 Ω抵抗に流れる0.4 Aによる電圧降下です。",
        derivation: ["前問からbc間を流れる電流は0.4 A。", "bc間の抵抗は2 Ω。", "Vbc=0.4 A×2 Ω=0.8 V。"],
        citation: "オームの法則（2024年度専門試験I 問1 図1）",
        statuteText: "抵抗の両端電圧は V=IR で求める。"
      },
      {
        explanation: "正答はイの1 Ωです。I1=0となる条件はb点とc点が同電位になるブリッジ平衡です。",
        derivation: ["I1=0ならb点とc点の電位が等しい。", "ブリッジ平衡条件は R_ab/R_bd=R_ac/R_cd。", "1/Rf=2/2=1 より Rf=1 Ω。"],
        citation: "ホイートストンブリッジの平衡条件（2024年度専門試験I 問1 図2）",
        statuteText: "対角枝の電流が0となる平衡条件は、4辺の抵抗比が等しいこと、すなわちR1/R2=R3/R4である。"
      }
    ];
    updates.forEach((update, index) => Object.assign(specialistQuestion.statements[index], { verificationStatus: "solution-verified", ...update }));
    if (window.SOURCE_MAPPING?.["specialist1-2024-1"]) {
      window.SOURCE_MAPPING["specialist1-2024-1"].status = "solution-verified";
    }
  }

  function verifyCommonChoice(year, number, updates) {
    const question = window.COMMON_QUESTION_BANK?.[year]?.find(item => item.number === number);
    if (!question) return;
    question.verificationStatus = "text-verified";
    question.reviewStatus = "text-verified";
    updates.forEach((update, index) => Object.assign(question.statements[index], { verificationStatus: "text-verified", ...update }));
  }

  const safetyManagement = {
    policy: {
      explanation: "正答は「方針」です。安全管理規程には、輸送の安全を確保するための事業の運営の方針を定めます。",
      citation: "鉄道事業法 第18条の3第2項第1号、鉄道事業法施行規則 第36条の3第1号",
      statuteText: "安全管理規程の内容として、輸送の安全を確保するための事業の運営の方針に関する事項が定められている。"
    },
    operation: {
      explanation: "正答は「運転」です。鉄道事業者は安全統括管理者及び運転管理者を選任します。",
      citation: "鉄道事業法 第18条の3第4項",
      statuteText: "鉄道事業者は、安全統括管理者及び運転管理者を選任しなければならない。第三種鉄道事業者は安全統括管理者を選任する。"
    },
    comparison: {
      explanation: "正答は「新旧対照表」です。変更後の規程とともに、変更箇所の新旧対照表を添付します。",
      citation: "鉄道事業法施行規則 第36条の2第5項第2号",
      statuteText: "安全管理規程変更届出書には、安全管理規程の変更箇所の新旧対照表を添付しなければならない。"
    },
    experience: {
      explanation: "正答は「10年」です。安全統括管理者には、鉄道事業の安全に関する業務経験が通算10年以上あること等が求められます。",
      citation: "鉄道事業法施行規則 第36条の4第1号",
      statuteText: "安全統括管理者は、鉄道事業の安全に関する業務経験が通算して10年以上である者又は同等以上の能力を有すると認められた者であること。"
    },
    disqualification: {
      explanation: "正答は「2年」です。解任命令を受けた者は、解任の日から2年を経過していなければ要件を満たしません。",
      citation: "鉄道事業法施行規則 第36条の4第3号",
      statuteText: "解任命令により解任され、その解任の日から2年を経過しない者でないことが要件とされる。"
    }
  };

  verifyCommonChoice(2022, 9, [safetyManagement.policy, safetyManagement.operation, safetyManagement.comparison, safetyManagement.experience]);
  verifyCommonChoice(2023, 6, [safetyManagement.policy, safetyManagement.operation, safetyManagement.experience, safetyManagement.disqualification]);
  verifyCommonChoice(2025, 9, [safetyManagement.policy, safetyManagement.operation, safetyManagement.experience, safetyManagement.disqualification]);
  verifyCommonChoice(2024, 6, [
    { explanation: "正答は「適正」です。鉄道事業法は鉄道事業等の運営を適正かつ合理的なものとすることを掲げています。", citation: "鉄道事業法 第1条", statuteText: "鉄道事業等の運営を適正かつ合理的なものとすることにより、同法の目的を達成する。" },
    { explanation: "正答は「安全」です。同法の直接の目的の一つは輸送の安全の確保です。", citation: "鉄道事業法 第1条", statuteText: "輸送の安全を確保することが目的として規定されている。" },
    { explanation: "正答は「利用者」です。保護対象は鉄道等の利用者の利益です。", citation: "鉄道事業法 第1条", statuteText: "鉄道等の利用者の利益を保護することが目的として規定されている。" },
    { explanation: "正答は「公共の福祉」です。条文は最終的に公共の福祉を増進することを目的としています。", citation: "鉄道事業法 第1条", statuteText: "鉄道事業等の健全な発達を図り、もって公共の福祉を増進することを目的とする。" }
  ]);

  const accidentReport = {
    death: { explanation: "正しい記述です。乗客、乗務員等に死亡者を生じた鉄道運転事故は速報対象です。", citation: "鉄道事故等報告規則 第5条第1項第1号", statuteText: "乗客、乗務員等に死亡者を生じた鉄道運転事故を速報対象としている。" },
    crossing: { explanation: "正しい記述です。踏切遮断機がない踏切道で発生し、死亡者を生じた事故は速報対象です。", citation: "鉄道事故等報告規則 第5条第1項第3号", statuteText: "踏切遮断機が設置されていない踏切道において発生し、死亡者を生じた事故を速報対象としている。" },
    cause: { explanation: "正しい記述です。係員の取扱い誤り又は車両・鉄道施設の故障等が原因のおそれがある事故は速報対象です。", citation: "鉄道事故等報告規則 第5条第1項第4号", statuteText: "取扱い誤り又は車両若しくは鉄道施設の故障等に原因があるおそれがある事故を速報対象としている。" },
    threeHours: { explanation: "速報基準は本線の運転を3時間以上支障すると認められるものです。", errorPoint: "問題文が1時間又は2時間としている場合は誤りで、正しくは3時間以上です。", citation: "鉄道事故等報告規則 第5条第1項第5号・第2項第1号", statuteText: "本線における運転を3時間以上支障すると認められる事故又は輸送障害が速報対象となる。" }
  };
  verifyCommonChoice(2022, 3, [
    accidentReport.death,
    { explanation: "誤りです。人数基準は3人以上ではなく、5人以上の死傷です。", errorPoint: "「3人以上」が誤りで、正しくは「5人以上」です。", citation: "鉄道事故等報告規則 第5条第1項第2号", statuteText: "5人以上の死傷を生じた鉄道運転事故を速報対象としている。" },
    accidentReport.crossing,
    accidentReport.threeHours
  ]);
  verifyCommonChoice(2025, 2, [
    { explanation: "誤りです。基準は3人以上の負傷ではなく、5人以上の死傷です。", errorPoint: "人数と被害区分の双方が不一致です。", citation: "鉄道事故等報告規則 第5条第1項第2号", statuteText: "5人以上の死傷を生じた鉄道運転事故を速報対象としている。" },
    accidentReport.crossing,
    accidentReport.cause,
    accidentReport.threeHours
  ]);
  verifyCommonChoice(2023, 8, [
    { explanation: "正答は3時間です。輸送障害の速報基準は本線の運転を3時間以上支障すると認められるものです。", citation: "鉄道事故等報告規則 第5条第2項第1号", statuteText: "3時間以上本線における運転を支障すると認められる輸送障害を速報対象としている。" },
    { explanation: "正答は2週間です。特に異例な輸送障害は発生日から2週間以内に報告書を提出します。", citation: "鉄道事故等報告規則 第5条第2項第2号", statuteText: "特に異例と認められる輸送障害は、発生日から2週間以内に報告書を提出する。" },
    { explanation: "正答は報告書です。異例な輸送障害について提出する書類は鉄道運転事故等報告書です。", citation: "鉄道事故等報告規則 第5条第2項", statuteText: "輸送障害の概要、原因、被害、対応を記載した鉄道運転事故等報告書を提出する。" },
    { explanation: "正答は届出書です。月次で取りまとめる書類は鉄道運転事故等届出書です。", citation: "鉄道事故等報告規則 第5条第4項", statuteText: "対象事故等を発生の翌月20日までに鉄道運転事故等届出書として地方運輸局長へ提出する。" }
  ]);
  verifyCommonChoice(2024, 9, [
    { explanation: "正答は30分です。旅客列車は30分以上の遅延が月次届出の対象です。", citation: "鉄道事故等報告規則 第5条第4項", statuteText: "旅客列車にあっては30分以上の遅延を生じた輸送障害を対象とする。" },
    { explanation: "正答は1時間です。旅客列車以外は1時間以上の遅延が対象です。", citation: "鉄道事故等報告規則 第5条第4項", statuteText: "旅客列車以外の列車にあっては1時間以上の遅延を生じた輸送障害を対象とする。" },
    { explanation: "正答は届出書です。月次で取りまとめる書類名は鉄道運転事故等届出書です。", citation: "鉄道事故等報告規則 第5条第4項", statuteText: "発生の翌月20日までに鉄道運転事故等届出書を提出する。" },
    { explanation: "正答は地方運輸局長です。月次届出書の提出先として明記されています。", citation: "鉄道事故等報告規則 第5条第4項", statuteText: "鉄道運転事故等届出書を地方運輸局長に提出しなければならない。" }
  ]);

  const definitionCitation = "鉄道に関する技術上の基準を定める省令 第2条";
  verifyCommonChoice(2023, 3, [
    { explanation: "誤りです。側線は列車の運転に常用される線路ではなく、本線でない線路です。", errorPoint: "本線の定義と取り違えています。", citation: `${definitionCitation}第6号`, statuteText: "側線とは、本線でない線路をいう。" },
    { explanation: "正しい記述です。車庫は専ら車両の収容を行う場所です。", citation: `${definitionCitation}第11号`, statuteText: "車庫とは、専ら車両の収容を行うために使用される場所をいう。" },
    { explanation: "誤りです。信号は係員に対して、列車だけでなく列車又は車両を運転するときの条件を現示します。", errorPoint: "「列車」が狭すぎ、正しくは「列車又は車両」です。", citation: `${definitionCitation}第17号`, statuteText: "信号とは、係員に対して、列車又は車両を運転するときの条件を現示するものをいう。" },
    { explanation: "正しい記述です。合図は係員相互間で合図者の意思を表示するものです。", citation: `${definitionCitation}第18号`, statuteText: "合図とは、係員相互間で、その相手方に対して合図者の意思を表示するものをいう。" }
  ]);
  verifyCommonChoice(2024, 3, [
    { explanation: "誤りです。軌間はレール頭部の中心間距離ではなく、レール頭部間の最短距離です。", errorPoint: "「中心間」が誤りで、正しくは「最短距離」です。", citation: `${definitionCitation}第4号`, statuteText: "軌間とは、軌道中心線が直線である区間におけるレール頭部間の最短距離をいう。" },
    { explanation: "正しい記述です。本線は列車の運転に常用される線路です。", citation: `${definitionCitation}第5号`, statuteText: "本線とは、列車の運転に常用される線路をいう。" },
    { explanation: "正しい記述です。駅は旅客の乗降又は貨物の積卸しを行う場所です。", citation: `${definitionCitation}第7号`, statuteText: "駅とは、旅客の乗降又は貨物の積卸しを行うために使用される場所をいう。" },
    { explanation: "誤りです。列車は「駅外」ではなく「停車場外」の線路を運転させる目的で組成された車両です。", errorPoint: "「駅外」が誤りで、正しくは「停車場外」です。", citation: `${definitionCitation}第13号`, statuteText: "列車とは、停車場外の線路を運転させる目的で組成された車両をいう。" }
  ]);
  verifyCommonChoice(2025, 3, [
    { explanation: "誤りです。本線は車両ではなく、列車の運転に常用される線路です。", errorPoint: "「車両」が誤りで、正しくは「列車」です。", citation: `${definitionCitation}第5号`, statuteText: "本線とは、列車の運転に常用される線路をいう。" },
    { explanation: "正しい記述です。停車場は駅、信号場及び操車場の総称です。", citation: `${definitionCitation}第10号`, statuteText: "停車場とは、駅、信号場及び操車場をいう。" },
    { explanation: "誤りです。鉄道信号は信号、転てつ器及び標識ではなく、信号、合図及び標識です。", errorPoint: "「転てつ器」が誤りで、正しくは「合図」です。", citation: `${definitionCitation}第16号`, statuteText: "鉄道信号とは、信号、合図及び標識をいう。" },
    { explanation: "正しい記述です。標識は係員に物の位置、方向、条件等を表示します。", citation: `${definitionCitation}第19号`, statuteText: "標識とは、係員に対して、物の位置、方向、条件等を表示するものをいう。" }
  ]);

  function verifySpecialistSolution(year, number, updates) {
    const question = window.SPECIALIST1_QUESTION_BANK?.[year]?.find(item => item.number === number);
    if (!question) return;
    question.verificationStatus = "solution-verified";
    question.reviewStatus = "solution-verified";
    updates.forEach((update, index) => Object.assign(question.statements[index], { verificationStatus: "solution-verified", ...update }));
  }

  verifySpecialistSolution(2021, 1, [
    { explanation: "C1とC2は並列なので合成容量はC1+C2です。これがL、Rと直列になり、正答はウです。", derivation: ["並列コンデンサの合成容量をCeq=C1+C2とする。", "各直列要素のインピーダンスを加える。", "Z=R+jωL+1/{jω(C1+C2)}。"], citation: "交流回路の複素インピーダンス", statuteText: "抵抗はR、コイルはjωL、コンデンサは1/(jωC)で表し、直列回路では加算する。" },
    { explanation: "電流最大は直列共振時で、誘導性リアクタンスと容量性リアクタンスが相殺します。", derivation: ["虚数部を0と置く。", "ωL-1/{ω(C1+C2)}=0。", "ω=√{1/[L(C1+C2)]}となり正答はア。"], citation: "直列共振条件", statuteText: "直列共振ではωL=1/(ωC)が成立する。" },
    { explanation: "2つの共振条件を連立するとC1=20 μFです。", derivation: ["C2=60 μF、ω=100より L(C1+60×10^-6)=1/10000。", "C2=300 μF、ω=50より L(C1+300×10^-6)=1/2500。", "両式から4(C1+60)=C1+300、よってC1=20 μF。"], citation: "直列共振条件の連立", statuteText: "ω²L(C1+C2)=1を2条件へ適用して未知容量を消去する。" },
    { explanation: "C1=20 μFを共振条件へ戻すとL=1.25 Hです。", derivation: ["C1+C2=80 μF。", "L=1/{100²×80×10^-6}。", "L=1/0.8=1.25 Hとなり正答はア。"], citation: "直列共振条件", statuteText: "L=1/{ω²(C1+C2)}で求める。" }
  ]);

  verifySpecialistSolution(2022, 1, [
    { explanation: "導体が磁界と直交して速度vで動くとき、誘導起電力の大きさはU=Bℓvです。", derivation: ["導体が時間dtに掃く面積はℓvdt。", "磁束変化はdΦ=Bℓvdt。", "U=dΦ/dt=Bℓv。方向はフレミング右手則で決める。"], citation: "運動起電力", statuteText: "磁束密度B、導体長ℓ、速度vが互いに直交するときU=Bℓvとなる。" },
    { explanation: "直線電流の周囲の磁界は電線を中心とする同心円状です。向きは右ねじの法則で決めます。", derivation: ["親指を電流方向へ向ける。", "残りの指が巻く向きが磁界の向き。", "原本図の電流方向と一致する図を選ぶ。"], citation: "アンペールの右ねじの法則", statuteText: "無限長直線電流の磁界は電線を中心とする円周方向に生じる。" },
    { explanation: "正答はファラデー・レンツの法則 e=-N dφ/dtです。", derivation: ["1巻当たりの磁束変化率をdφ/dtとする。", "N巻の鎖交磁束はNφ。", "変化を妨げる向きを負号で表しe=-N dφ/dt。"], citation: "ファラデーの電磁誘導則、レンツの法則", statuteText: "誘導起電力は鎖交磁束の時間変化率に比例し、その変化を妨げる向きに生じる。" },
    { explanation: "平行2線間の力は電流I1とI2の積に比例するため、両方を2倍にすると4倍です。", derivation: ["単位長さ当たりの力F/ℓ=μI1I2/(2πd)。", "I1とI2を各2倍にする。", "積は(2I1)(2I2)=4I1I2となる。"], citation: "平行電流間に働く力", statuteText: "平行導体間の電磁力は2本の導体電流の積に比例する。" }
  ]);

  verifySpecialistSolution(2023, 1, [
    { explanation: "スイッチ投入直後の電流は0 Aです。インダクタ電流は瞬時に変化できません。", derivation: ["投入前の電流は0 A。", "インダクタ電流の連続性よりi(0+)=i(0-)=0。", "正答はア。"], citation: "インダクタ電流の連続性", statuteText: "有限電圧のもとでインダクタ電流は瞬時に変化しない。" },
    { explanation: "十分時間が経過するとコイルは直流に対して短絡相当となり、電流はE/Rです。", derivation: ["定常状態ではdi/dt=0。", "コイル電圧Ldi/dtは0。", "抵抗だけが電圧を受けI=E/Rとなる。"], citation: "直流LR回路の定常状態", statuteText: "直流定常状態の理想インダクタは短絡として扱う。" },
    { explanation: "抵抗電圧はE(1-e^{-Rt/L})です。電流の立上がりにRを乗じます。", derivation: ["回路方程式Ldi/dt+Ri=Eを立てる。", "i(0)=0で解くとi(t)=E/R(1-e^{-Rt/L})。", "vR=Ri=E(1-e^{-Rt/L})。"], citation: "一階線形微分方程式によるLR過渡応答", statuteText: "LR直列回路の投入電流は最終値E/Rへ指数関数的に近づく。" },
    { explanation: "時定数はL/Rです。指数部をe^{-t/τ}と比較します。", derivation: ["指数部はe^{-Rt/L}。", "標準形e^{-t/τ}と比較する。", "1/τ=R/Lよりτ=L/R。"], citation: "LR回路の時定数", statuteText: "LR直列回路の時定数はインダクタンスを抵抗で除したL/R秒である。" }
  ]);

  const specialist2025Q1 = window.SPECIALIST1_QUESTION_BANK?.[2025]?.find(item => item.number === 1);
  if (specialist2025Q1) {
    specialist2025Q1.verificationStatus = "solution-verified";
    specialist2025Q1.reviewStatus = "solution-verified";
    specialist2025Q1.statements.forEach(statement => { statement.verificationStatus = "solution-verified"; });
  }

  const implementationStandard = {
    comply: { explanation: "正しい記述です。鉄道事業者は実施基準を定め、これを遵守しなければなりません。", citation: "鉄道に関する技術上の基準を定める省令 第3条第1項", statuteText: "鉄道事業者は、実施基準を定め、これを遵守しなければならない。" },
    consult: { explanation: "正しい記述です。営業主体ではない建設主体は、制定又は変更前に営業主体へ協議します。", citation: "同省令 第3条第2項", statuteText: "建設主体は、実施基準を定め又は変更しようとするとき、あらかじめ営業主体に協議しなければならない。" },
    details: { explanation: "実施基準は、国土交通大臣が省令実施に関する細目を告示で定めた場合、その細目に従います。", citation: "同省令 第3条第3項", statuteText: "国土交通大臣が省令の実施に関する細目を告示で定めたときは、これに従って実施基準を定める。" },
    notify: { explanation: "制定又は変更の手続は認可・許可ではなく、あらかじめ行う届出です。", errorPoint: "認可又は許可とする記述は誤りで、正しくは届出です。", citation: "同省令 第3条第4項", statuteText: "実施基準を定め又は変更しようとするときは、あらかじめ地方運輸局長等に届け出なければならない。" },
    instruct: { explanation: "正しい記述です。省令に適合しない実施基準について、地方運輸局長等は変更を指示できます。", citation: "同省令 第3条第5項", statuteText: "地方運輸局長は、実施基準が省令に適合しないと認めるときは、変更すべきことを指示できる。" }
  };
  verifyCommonChoice(2022, 4, [implementationStandard.comply, implementationStandard.details, implementationStandard.notify, implementationStandard.instruct]);
  verifyCommonChoice(2023, 9, [implementationStandard.comply, implementationStandard.consult, implementationStandard.details, implementationStandard.instruct]);
  verifyCommonChoice(2024, 4, [
    implementationStandard.comply,
    implementationStandard.consult,
    { explanation: "誤りです。告示で定めるのは省令実施に関する「解釈」ではなく「細目」です。", errorPoint: "「解釈」が誤りで、正しくは「細目」です。", citation: "同省令 第3条第3項", statuteText: "国土交通大臣がこの省令の実施に関する細目を告示で定めたときは、これに従う。" },
    implementationStandard.notify
  ]);
  verifyCommonChoice(2025, 4, [
    implementationStandard.comply,
    implementationStandard.details,
    { ...implementationStandard.notify, explanation: "正しい記述です。実施基準の制定又は変更は、あらかじめ地方運輸局長等へ届け出ます。", errorPoint: "記述は届出手続と提出先の双方が条文に一致します。" },
    { explanation: "誤りです。複数の管轄区域にわたる場合、すべての地方運輸局長ではなく、主として関係する土地を管轄する地方運輸局長へ提出します。", errorPoint: "「それぞれの地方運輸局長」が誤りです。", citation: "同省令 第4条第1項", statuteText: "事案が二以上の管轄区域にわたるときは、主として関係する土地を管轄する地方運輸局長へ提出する。" }
  ]);

  const personnel = {
    training: { explanation: "正しい記述です。運転関係係員だけでなく、施設・車両の保守等を行う係員も教育及び訓練の対象です。", citation: "鉄道に関する技術上の基準を定める省令 第10条第1項", statuteText: "運転に直接関係する係員並びに施設及び車両の保守等を行う係員へ、必要な知識及び技能の教育・訓練を行う。" },
    qualification: { explanation: "正しい記述です。必要な適性、知識及び技能を確認した後でなければ作業を行わせられません。", citation: "同省令 第10条第2項", statuteText: "必要な適性、知識及び技能を保有していることを確かめた後でなければ作業を行わせてはならない。" },
    condition: { explanation: "知識及び技能を十分に発揮できない状態では、例外なく当該作業を行わせてはなりません。", errorPoint: "「緊急の場合を除いて」「緊急時を除いて」という例外はありません。", citation: "同省令 第10条第3項", statuteText: "知識及び技能を十分に発揮できない状態にあると認めるときは、その作業を行わせてはならない。" },
    procedure: { explanation: "正しい記述です。所属する鉄道事業者が実施要領を定め、管理を自ら行う場合は他者へ実施させることもできます。", citation: "同省令解釈基準 II-1 第10条関係 4", statuteText: "教育・訓練及び適性等の確認は鉄道事業者が実施要領を定めて行い、管理を行う場合は他者に行わせることができる。" }
  };
  verifyCommonChoice(2023, 4, [
    { explanation: "誤りです。施設及び車両の保守等を行う係員も教育及び訓練の対象です。", errorPoint: "保守係員を対象外とするただし書はありません。", citation: personnel.training.citation, statuteText: personnel.training.statuteText },
    personnel.qualification,
    personnel.condition,
    personnel.procedure
  ]);
  verifyCommonChoice(2024, 5, [
    personnel.training,
    personnel.condition,
    personnel.qualification,
    { explanation: "誤りです。適性確認を身体機能検査・精神機能検査で行う点は正しいものの、解釈基準には問題文の2年・3年という周期規定はありません。", errorPoint: "検査周期の記述が根拠資料にありません。", citation: "同省令解釈基準 II-1 第10条関係 3", statuteText: "運転に直接関係する係員の適性確認は、身体機能検査及び精神機能検査により行う。" }
  ]);

  function verifySpecialistStatements(year, number, updates) {
    const question = window.SPECIALIST1_QUESTION_BANK?.[year]?.find(item => item.number === number);
    if (!question) return;
    updates.forEach(({ index, ...update }) => Object.assign(question.statements[index], { verificationStatus: "text-verified", ...update }));
    if (question.statements.every(statement => statement.verificationStatus === "text-verified")) {
      question.verificationStatus = "text-verified";
      question.reviewStatus = "text-verified";
      if (window.SOURCE_MAPPING?.[`specialist1-${year}-${number}`]) {
        window.SOURCE_MAPPING[`specialist1-${year}-${number}`].status = "text-verified";
      }
    }
  }

  verifySpecialistStatements(2024, 20, [
    {
      index: 0,
      explanation: "正しい記述です。スプリアス発射の定義は、必要周波数帯外の発射のうち情報伝送へ影響を与えず低減できるものとし、高調波・低調波・寄生発射・相互変調積を含み、帯域外発射を除外しています。",
      errorPoint: "列挙されている発射の種類と、帯域外発射を含まない点が施行規則の定義に一致します。",
      citation: "電波法施行規則 第2条第1項第63号",
      statuteText: "スプリアス発射とは、必要周波数帯外の一又は二以上の周波数の発射で、そのレベルを情報伝送に影響を与えず低減できるものをいい、高調波発射、低調波発射、寄生発射及び相互変調積を含み、帯域外発射を含まない。"
    },
    {
      index: 1,
      explanation: "誤りです。帯域外発射は無変調時に生ずる発射ではなく、情報伝送のための変調過程で生ずる発射です。",
      errorPoint: "「無変調時」が誤りで、正しくは「情報の伝送のための変調の過程」です。",
      derivation: ["必要周波数帯に近接する発射である点は正しい。", "発生原因を施行規則の定義と照合する。", "定義は変調過程で生ずるものとしているため、無変調時とする記述は誤り。"],
      citation: "電波法施行規則 第2条第1項第63号の2",
      statuteText: "帯域外発射とは、必要周波数帯に近接する周波数の電波の発射で、情報の伝送のための変調の過程において生ずるものをいう。"
    }
  ]);

  verifySpecialistStatements(2025, 19, [
    {
      index: 2,
      explanation: "正しい記述です。主任無線従事者の職務には、無線設備の機器の点検・保守を自ら行うこと、又はその監督を行うことが明記されています。",
      errorPoint: "点検若しくは保守、又はその監督という職務範囲が施行規則本文と一致します。",
      citation: "電波法施行規則 第34条の5第2号",
      statuteText: "主任無線従事者の職務として、無線設備の機器の点検若しくは保守を行い、又はその監督を行うことが定められている。"
    }
  ]);

  verifySpecialistStatements(2021, 14, [
    { index: 0, explanation: "正答はウの「感電」です。省令は、電気機器、配電盤等を感電及び火災のおそれがないように施設することを要求しています。", citation: "鉄道に関する技術上の基準を定める省令 第50条", statuteText: "電気機器、配電盤その他これに類する設備は、感電及び火災のおそれのないように施設しなければならない。" },
    { index: 1, explanation: "正答はオの「油入機器」です。油入機器は延焼防止のため、隔壁を設けるか他の機器から十分に離隔します。", citation: "同省令解釈基準 VI-9 第50条関係 2", statuteText: "変電所等の油入機器は、延焼防止のため隔壁を設けるか又は他の機器から十分離隔する。" },
    { index: 2, explanation: "正答はエの「アーク」です。対象電圧の開閉器等で、動作時にアークを生ずる機器について可燃物との離隔が定められています。", citation: "同省令解釈基準 VI-9 第50条関係 4", statuteText: "600 Vを超え7,000 V以下で使用し、動作時にアークを生ずる開閉器等は、可燃性物質から1 m以上離す。" },
    { index: 3, explanation: "正答はアの「1 m」です。600 V超7,000 V以下の機器に適用する離隔距離は1 m以上です。", derivation: ["使用電圧の範囲を確認する。", "600 V超7,000 V以下の区分を選ぶ。", "同区分の離隔値は1 m以上。"], citation: "同省令解釈基準 VI-9 第50条関係 4", statuteText: "600 Vを超え7,000 V以下の電圧に使用する対象機器は、可燃性物質から1 m以上離す。耐火性物質で隔離した場合は除く。" }
  ]);

  verifySpecialistStatements(2022, 6, [
    { index: 0, explanation: "正しい記述です。電力貯蔵装置に過電流が生じた場合は、自動遮断装置を動作させる条件に含まれます。", citation: "同省令解釈基準 VI-9 第50条関係 5(1)", statuteText: "電力貯蔵装置に過電流が生じた場合、自動的に一次側回路又は母線から遮断する装置を設ける。" },
    { index: 1, explanation: "誤りです。遮断条件は過充電又は過放電を「繰り返した場合」ではなく、過充電又は過放電と「なった場合」です。", errorPoint: "「繰り返した」が余分です。過充電又は過放電となった時点が遮断条件です。", citation: "同省令解釈基準 VI-9 第50条関係 5(3)", statuteText: "電力貯蔵装置が過充電又は過放電となった場合に遮断する。ただし、制御装置で充放電を管理するものを除く。" },
    { index: 2, explanation: "誤りです。遮断条件は温度が著しく低下した場合ではなく、著しく上昇した場合です。", errorPoint: "「低下」が誤りで、正しくは「上昇」です。", citation: "同省令解釈基準 VI-9 第50条関係 5(5)", statuteText: "電力貯蔵装置の温度が著しく上昇した場合に、自動遮断する。" },
    { index: 3, explanation: "正しい記述です。他の変成機器等の異常検知によるき電停止も遮断条件です。直流開閉所はこの条件から除かれます。", citation: "同省令解釈基準 VI-9 第50条関係 5(6)", statuteText: "他の変成機器等の異常を検知したことによりき電停止した場合に遮断する。直流の開閉所を除く。" }
  ]);

  verifySpecialistStatements(2023, 6, [
    { index: 0, explanation: "正しい記述です。変電所以外の単巻変圧器を人家に接近して施設する場合は、隔壁と消火設備の双方を設けます。", citation: "同省令解釈基準 VI-9 第50条関係 1", statuteText: "単巻変圧器き電方式の単巻変圧器を人家に接近して施設する場合は、隔壁及び消火設備を設ける。変電所に設けるものを除く。" },
    { index: 1, explanation: "誤りです。解釈基準は油入機器を他の機器から「十分離隔」すると定めており、3 mという一律の距離は規定していません。", errorPoint: "「3 m以上」が誤りです。隔壁を設けるか、他の機器から十分離隔します。", citation: "同省令解釈基準 VI-9 第50条関係 2", statuteText: "変電所等の油入機器は、延焼防止のため隔壁を設けるか又は他の機器から十分離隔する。" },
    { index: 2, explanation: "正しい記述です。露出充電部を持つ開閉器・配電盤や屋外電気機器は、人が容易に触れないように設けます。", citation: "同省令解釈基準 VI-9 第50条関係 3", statuteText: "充電部を露出した開閉器及び配電盤並びに屋外に設ける電気機器は、人が充電部に容易に触れるおそれのないように設ける。" },
    { index: 3, explanation: "誤りです。電圧区分と1 mの離隔は正しいですが、隔離に用いる物質は「不燃性物質」ではなく「耐火性物質」です。", errorPoint: "「不燃性物質」が誤りで、正しくは「耐火性物質」です。", citation: "同省令解釈基準 VI-9 第50条関係 4", statuteText: "対象機器は可燃性物質から所定距離を離す。ただし、耐火性物質で両者の間を隔離した場合は除く。" }
  ]);
})();
