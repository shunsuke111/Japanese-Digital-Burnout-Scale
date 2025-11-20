document.addEventListener('DOMContentLoaded', () => {
    // --- 1. データ定義 ---

    const questions = [
        // 第1因子：デジタル老化 (DA)
        { text: "1. うつの症状があるのではないかと考え始めている。", factor: 1 },
        { text: "2. 孤独感に支配されている。", factor: 1 },
        { text: "3. 制限されているように感じる。", factor: 1 },
        { text: "4. ストレスを感じている。", factor: 1 },
        { text: "5. 心身の状態を把握できていない。", factor: 1 },
        { text: "6. ときどき、頭の中がぼんやりしているように感じる。", factor: 1 },
        { text: "7. バーチャル空間やデジタル空間のせいで、疲れを感じる。", factor: 1 },
        { text: "8. いつか正気を失ってしまうのではないかと思っている。", factor: 1 },
        { text: "9. 注意力が欠如している。", factor: 1 },
        { text: "10. 人との関係やコミュニケーションが希薄になっている。", factor: 1 },
        { text: "11. デジタル機器を使ってデジタル空間に長時間いる。", factor: 1 },
        // 第2因子：デジタル剥奪 (DD)
        { text: "12. インターネットに接続していないときや、オフラインのときに不安を感じる。", factor: 2 },
        { text: "13. インターネットに接続していないときや、オフラインのときは無力感を感じる。", factor: 2 },
        { text: "14. LINE、YouTube、Instagram、X(旧Twitter)、TikTokを常にチェックしないと、違和感や不安を感じる。", factor: 2 },
        { text: "15. デジタル機器（スマホ、タブレット、パソコンなど）が手元にないと無防備のような気がする。", factor: 2 },
        // 第3因子：情緒的消耗 (EE)
        { text: "16. 短気になった。", factor: 3 },
        { text: "17. せっかちになった。", factor: 3 },
        { text: "18. 周囲の人に対して寛容でなくなったり、感情が鈍くなっていると感じる。", factor: 3 }
    ];

    const options = [
        { text: "全くそう思わない", value: 1 },
        { text: "そう思わない", value: 2 },
        { text: "どちらともいえない", value: 3 },
        { text: "そう思う", value: 4 },
        { text: "非常にそう思う", value: 5 }
    ];

    const MEAN = 42.96;
    const SD = 12.50;
    const LEVEL_1_MAX = MEAN - 1.5 * SD;
    const LEVEL_2_MAX = MEAN - 0.5 * SD;
    const LEVEL_3_MAX = MEAN + 0.5 * SD;
    const LEVEL_4_MAX = MEAN + 1.5 * SD;

    const FACTOR1_MEAN = 27.18;
    const FACTOR2_MEAN = 9.78;
    const FACTOR3_MEAN = 6.00;

    const questionsContainer = document.getElementById('questionsContainer');
    const form = document.getElementById('burnoutForm');
    const resultsDiv = document.getElementById('results');
    const errorMessage = document.getElementById('errorMessage');
    const resetButton = document.getElementById('resetButton');
    const adviceSection = document.getElementById('adviceSection');
    const adviceTextElement = document.getElementById('adviceText');

    // --- 質問の動的生成 ---
    function renderQuestions() {
        let html = '';
        questions.forEach((q, index) => {
            html += `<fieldset class="border border-gray-200 rounded-lg p-5 shadow-sm">`;
            html += `<legend class="text-lg font-semibold text-gray-800 px-2">${q.text}</legend>`;
            html += `<div class="flex flex-wrap justify-center gap-2 md:gap-4 mt-4">`;

            options.forEach(opt => {
                const inputId = `q${index}_${opt.value}`;
                html += `
                    <div>
                        <input type="radio" name="q${index}" id="${inputId}" value="${opt.value}" required>
                        <label for="${inputId}" 
                               class="rating-label block cursor-pointer px-3 py-2 md:px-5 md:py-3 
                                      text-center text-sm md:text-base font-medium">
                            ${opt.text}
                        </label>
                    </div>
                `;
            });

            html += `</div></fieldset>`;
        });
        questionsContainer.innerHTML = html;
    }

    function getLevel(score) {
        if (score < LEVEL_1_MAX) {
            return { level: "レベル1 (低い)", description: "デジタルバーンアウトの傾向は、調査参加者(N=231)の中で平均と比べて「低い」レベルです。" };
        } else if (score < LEVEL_2_MAX) {
            return { level: "レベル2 (やや低い)", description: "デジタルバーンアウトの傾向は、調査参加者(N=231)の中で「やや低い」レベルです。" };
        } else if (score < LEVEL_3_MAX) {
            return { level: "レベル3 (平均)", description: "デジタルバーンアウトの傾向は、調査参加者(N=231)の中で「平均的」なレベルです。" };
        } else if (score < LEVEL_4_MAX) {
            return { level: "レベル4 (やや高い)", description: "デジタルバーンアウトの傾向は、調査参加者(N=231)の中で「やや高い」レベルです。少し注意が必要かもしれません。" };
        } else {
            return { level: "レベル5 (高い)", description: "デジタルバーンアウトの傾向は、調査参加者(N=231)の中で「高い」レベルです。デジタルデトックスや休息を意識的にとることをお勧めします。" };
        }
    }

    function getAdvice(scoreDA, scoreDD, scoreEE) {
        const isHighDA = scoreDA > FACTOR1_MEAN;
        const isHighDD = scoreDD > FACTOR2_MEAN;
        const isHighEE = scoreEE > FACTOR3_MEAN;

        if (isHighDA && isHighDD && isHighEE) {
            return "デジタル疲労・依存的不安・情緒的ストレスが同時に高い“総合的負荷”タイプです。いきなりやめるより、短いオフ時間を安全に積み重ねて心と脳の回復を優先するのが効果的です。";
        } else if (isHighDA && isHighDD) {
            return "疲労＋依存傾向の両方が高いタイプです。急なデジタル断ちは逆効果になる可能性があります。";
        } else if (isHighDA && isHighEE) {
            return "疲労＋心の消耗がセットで悪化しやすいタイプです。集中的な休息を優先しましょう。";
        } else if (isHighDD && isHighEE) {
            return "不安＋ストレスが組み合わさるため、デジタルとの境界線を作ることが鍵となります。";
        } else if (isHighDA) {
            return "25–30分作業 → 5分休憩など、疲労のメイン原因がデジタル機器を「使いすぎ」のタイプです。作業サイクルを見直しましょう。";
        } else if (isHighDD) {
            return "デジタル断ちへの不安が中心です。短いデジタルデトックス習慣が改善に効くでしょう。";
        } else if (isHighEE) {
            return "人間関係や通知に疲れたタイプです。心の休息を優先させましょう。";
        } else {
            return "現在のところ、各因子のスコアは平均を下回っており、バランスの取れた状態です。";
        }
    }

    function calculateAndShowResults(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const answers = [];

        for (let i = 0; i < questions.length; i++) {
            const answer = formData.get(`q${i}`);
            if (!answer) {
                errorMessage.classList.remove('hidden');
                document.getElementsByName(`q${i}`)[0].closest('fieldset').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            answers.push(parseInt(answer, 10));
        }

        errorMessage.classList.add('hidden');

        let totalScore = 0;
        let scoreFactor1 = 0;
        let scoreFactor2 = 0;
        let scoreFactor3 = 0;

        answers.forEach((answer, index) => {
            totalScore += answer;
            const factor = questions[index].factor;
            if (factor === 1) scoreFactor1 += answer;
            if (factor === 2) scoreFactor2 += answer;
            if (factor === 3) scoreFactor3 += answer;
        });

        const levelInfo = getLevel(totalScore);
        const adviceText = getAdvice(scoreFactor1, scoreFactor2, scoreFactor3);

        document.getElementById('totalScoreDisplay').textContent = totalScore;
        document.getElementById('levelDisplay').textContent = levelInfo.level;
        document.getElementById('levelDescription').textContent = levelInfo.description;

        adviceTextElement.textContent = adviceText;
        adviceSection.classList.remove('hidden');

        document.getElementById('factor1Score').textContent = scoreFactor1;
        document.getElementById('factor1Mean').textContent = FACTOR1_MEAN.toFixed(2);

        document.getElementById('factor2Score').textContent = scoreFactor2;
        document.getElementById('factor2Mean').textContent = FACTOR2_MEAN.toFixed(2);

        document.getElementById('factor3Score').textContent = scoreFactor3;
        document.getElementById('factor3Mean').textContent = FACTOR3_MEAN.toFixed(2);

        setTimeout(() => {
            document.getElementById('factor1Bar').style.width = `${(scoreFactor1 / 55) * 100}%`;
            document.getElementById('factor2Bar').style.width = `${(scoreFactor2 / 20) * 100}%`;
            document.getElementById('factor3Bar').style.width = `${(scoreFactor3 / 15) * 100}%`;
        }, 100);

        form.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    function resetForm() {
        form.reset();
        resultsDiv.classList.add('hidden');
        errorMessage.classList.add('hidden');
        adviceSection.classList.add('hidden');
        form.classList.remove('hidden');

        document.getElementById('factor1Bar').style.width = '0%';
        document.getElementById('factor2Bar').style.width = '0%';
        document.getElementById('factor3Bar').style.width = '0%';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    form.addEventListener('submit', calculateAndShowResults);
    resetButton.addEventListener('click', resetForm);

    renderQuestions();
});
