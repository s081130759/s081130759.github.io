(function applyPdfExtractionFixes() {
  const bank = window.SPECIALIST1_QUESTION_BANK;
  if (!bank) return;

  function option(year, questionNumber, statementIndex, key, text) {
    const question = bank[year]?.find(item => item.number === questionNumber);
    const target = question?.statements?.[statementIndex]?.options?.find(item => item.key === key);
    if (target) target.text = text;
  }

  option(2021, 1, 3, "オ", "25");
  option(2022, 1, 3, "オ", "32");
  option(2022, 2, 3, "オ", "400");
  option(2023, 1, 3, "オ", "LR");
  option(2023, 14, 3, "オ", "1.30");
  option(2024, 1, 3, "オ", "3.2");
  option(2025, 24, 3, "エ", "車両停止標識");

  const figureOptions = bank[2022]?.find(item => item.number === 1)?.statements?.[1]?.options || [];
  figureOptions.forEach(item => {
    if (!item.text.trim()) item.text = `図の選択肢${item.key}（上の原本図版を参照）`;
  });

  const specialist2022Q6 = bank[2022]?.find(item => item.number === 6);
  if (specialist2022Q6) {
    specialist2022Q6.prompt = "次の記述は、「鉄道に関する技術上の基準を定める省令」の解釈基準における電気機器等設備の施設について述べたものである。①～④について正しい記述には○を、誤った記述には×を選びなさい。直流の変電所におけるき電用遮断器の一次側の回路又は直流の開閉所における母線に接続する電力貯蔵装置（フライホイールを除く。）は、次に掲げる場合において自動的に当該一次側回路又は母線から遮断する装置を設けること。";
    const statementTexts = [
      "電力貯蔵装置に過電流が生じた場合",
      "電力貯蔵装置が過充電又は過放電を繰り返した場合（制御装置により充電又は放電を管理するものを除く。）",
      "電力貯蔵装置の温度が著しく低下した場合",
      "他の変成機器等の異常を検知したことによりき電停止した場合（直流の開閉所を除く。）"
    ];
    specialist2022Q6.statements.forEach((statement, index) => {
      statement.label = `${index + 1}.`;
      statement.text = statementTexts[index];
    });
  }
})();
