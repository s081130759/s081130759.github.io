(function applySpecialistDiagramPages() {
  const references = {
  "2021-1": [
    {
      "page": 3,
      "asset": "assets/specialist1/2021/pages/p03.webp",
      "sourcePdf": "sources/exams/2021/sen1denki_2021.pdf"
    }
  ],
  "2021-28": [
    {
      "page": 15,
      "asset": "assets/specialist1/2021/pages/p15.webp",
      "sourcePdf": "sources/exams/2021/sen1denki_2021.pdf"
    }
  ],
  "2021-29": [
    {
      "page": 15,
      "asset": "assets/specialist1/2021/pages/p15.webp",
      "sourcePdf": "sources/exams/2021/sen1denki_2021.pdf"
    }
  ],
  "2022-1": [
    {
      "page": 3,
      "asset": "assets/specialist1/2022/pages/p03.webp",
      "sourcePdf": "sources/exams/2022/sen1denki_2022.pdf"
    }
  ],
  "2022-2": [
    {
      "page": 4,
      "asset": "assets/specialist1/2022/pages/p04.webp",
      "sourcePdf": "sources/exams/2022/sen1denki_2022.pdf"
    }
  ],
  "2022-11": [
    {
      "page": 9,
      "asset": "assets/specialist1/2022/pages/p09.webp",
      "sourcePdf": "sources/exams/2022/sen1denki_2022.pdf"
    }
  ],
  "2022-12": [
    {
      "page": 10,
      "asset": "assets/specialist1/2022/pages/p10.webp",
      "sourcePdf": "sources/exams/2022/sen1denki_2022.pdf"
    }
  ],
  "2022-13": [
    {
      "page": 10,
      "asset": "assets/specialist1/2022/pages/p10.webp",
      "sourcePdf": "sources/exams/2022/sen1denki_2022.pdf"
    },
    {
      "page": 11,
      "asset": "assets/specialist1/2022/pages/p11.webp",
      "sourcePdf": "sources/exams/2022/sen1denki_2022.pdf"
    }
  ],
  "2022-18": [
    {
      "page": 14,
      "asset": "assets/specialist1/2022/pages/p14.webp",
      "sourcePdf": "sources/exams/2022/sen1denki_2022.pdf"
    }
  ],
  "2022-30": [
    {
      "page": 21,
      "asset": "assets/specialist1/2022/pages/p21.webp",
      "sourcePdf": "sources/exams/2022/sen1denki_2022.pdf"
    }
  ],
  "2023-1": [
    {
      "page": 3,
      "asset": "assets/specialist1/2023/pages/p03.webp",
      "sourcePdf": "sources/exams/2023/sen1denki_2023.pdf"
    }
  ],
  "2023-2": [
    {
      "page": 4,
      "asset": "assets/specialist1/2023/pages/p04.webp",
      "sourcePdf": "sources/exams/2023/sen1denki_2023.pdf"
    }
  ],
  "2023-14": [
    {
      "page": 10,
      "asset": "assets/specialist1/2023/pages/p10.webp",
      "sourcePdf": "sources/exams/2023/sen1denki_2023.pdf"
    }
  ],
  "2023-17": [
    {
      "page": 12,
      "asset": "assets/specialist1/2023/pages/p12.webp",
      "sourcePdf": "sources/exams/2023/sen1denki_2023.pdf"
    }
  ],
  "2023-25": [
    {
      "page": 16,
      "asset": "assets/specialist1/2023/pages/p16.webp",
      "sourcePdf": "sources/exams/2023/sen1denki_2023.pdf"
    }
  ],
  "2024-1": [
    {
      "page": 3,
      "asset": "assets/specialist1/2024/pages/p03.webp",
      "sourcePdf": "sources/exams/2024/sen1denki_2024.pdf"
    }
  ],
  "2024-2": [
    {
      "page": 4,
      "asset": "assets/specialist1/2024/pages/p04.webp",
      "sourcePdf": "sources/exams/2024/sen1denki_2024.pdf"
    }
  ],
  "2024-3": [
    {
      "page": 4,
      "asset": "assets/specialist1/2024/pages/p04.webp",
      "sourcePdf": "sources/exams/2024/sen1denki_2024.pdf"
    }
  ],
  "2024-23": [
    {
      "page": 14,
      "asset": "assets/specialist1/2024/pages/p14.webp",
      "sourcePdf": "sources/exams/2024/sen1denki_2024.pdf"
    }
  ],
  "2024-24": [
    {
      "page": 15,
      "asset": "assets/specialist1/2024/pages/p15.webp",
      "sourcePdf": "sources/exams/2024/sen1denki_2024.pdf"
    }
  ],
  "2024-28": [
    {
      "page": 18,
      "asset": "assets/specialist1/2024/pages/p18.webp",
      "sourcePdf": "sources/exams/2024/sen1denki_2024.pdf"
    }
  ],
  "2025-1": [
    {
      "page": 3,
      "asset": "assets/specialist1/2025/pages/p03.webp",
      "sourcePdf": "sources/exams/2025/sen1denki_2025.pdf"
    }
  ],
  "2025-13": [
    {
      "page": 9,
      "asset": "assets/specialist1/2025/pages/p09.webp",
      "sourcePdf": "sources/exams/2025/sen1denki_2025.pdf"
    }
  ],
  "2025-24": [
    {
      "page": 15,
      "asset": "assets/specialist1/2025/pages/p15.webp",
      "sourcePdf": "sources/exams/2025/sen1denki_2025.pdf"
    }
  ],
  "2025-30": [
    {
      "page": 18,
      "asset": "assets/specialist1/2025/pages/p18.webp",
      "sourcePdf": "sources/exams/2025/sen1denki_2025.pdf"
    }
  ]
};
  for (const [key, pages] of Object.entries(references)) {
    const [year, questionNumber] = key.split("-").map(Number);
    const question = window.SPECIALIST1_QUESTION_BANK?.[year]?.find(item => item.number === questionNumber);
    if (!question || question.diagram) continue;
    question.diagram = pages.map(page => `<figure class="source-page-figure"><img src="${page.asset}" alt="${year}年度専門試験I 問${questionNumber}を含む公式試験PDF ${page.page}ページ"><figcaption class="diagram-caption">${year}年度専門試験I 問${questionNumber} 原本PDF ${page.page}ページ（図版確認用）</figcaption></figure>`).join("");
    question.diagramSource = pages;
  }
})();
