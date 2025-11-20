document.addEventListener('DOMContentLoaded', () => {
    // --- 1. データ定義 ---

    // 質問項目
    const questions = [
        // 第1因子：デジタル老化 (DA) (11項目)
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
        // 第2因子：デジタル剥奪 (DD) (4項目)
        { text: "12. インターネットに接続していないときや、オフラインのときに不安を感じる。", factor: 2 },
        { text: "13. インターネットに接続していないときや、オフラインのときは無力感を感じる。", factor: 2 },
        { text: "14. LINE、YouTube、Instagram、X(旧Twitter)、TikTokを常にチェックしないと、違和感や不安を感じる。", factor: 2 },
        { text: "15. デジタル機器（スマホ、タブレット、パソコンなど）が手元にないと無防備のような気がする。", factor: 2 },
        // 第3因子：情緒的消耗 (EE) (3項目)
        { text: "16. 短気になった。", factor: 3 },
        { text: "17. せっかちになった。", factor: 3 },
        { text: "18. 周囲の人に対して寛容でなくなったり、感情が鈍くなっていると感じる。", factor: 3 }
    ];

    // 回答選択肢 (5段階リッカート尺度)
    const options = [
        { text: "全くそう思わない", value: 1 },
        { text: "そう思わない", value: 2 },
        { text: "どちらともいえない", value: 3 },
        { text: "そう思う", value: 4 },
        { text: "非常にそう思う", value: 5 }
    ];

    // 基準データ (N=231)
    const MEAN = 42.96;
    const SD = 12.50;

    // 5段階評価の境界値 (SDに基づく)
    const LEVEL_1_MAX = MEAN - 1.5 * SD; // 24.21
    const LEVEL_2_MAX = MEAN - 0.5 * SD; // 36.71
    const LEVEL_3_MAX = MEAN + 0.5 * SD; // 49.21
    const LEVEL_4_MAX = MEAN + 1.5 * SD; // 61.71

    // 下位尺度の基準データ (N=231)
    const FACTOR1_MEAN = 27.18; // DA
    const FACTOR1_SD = 8.74;
    const FACTOR2_MEAN = 9.78;  // DD
    const FACTOR2_SD = 3.97;
    const FACTOR3_MEAN = 6.00;  // EE
    const FACTOR3_SD = 2.85;

    // DOM要素の取得
    const questionsContainer = document.getElementById('questionsContainer');
    const form = document.getElementById('burnoutForm');
    const resultsDiv = document.getElementById('results');
    const errorMessage = document.getElementById('errorMessage');
    const resetButton = document.getElementById('resetButton');
    const adviceSection = document.getElementById('adviceSection');
    const adviceTextElement = document.getElementById('adviceText');

    // --- 2. 質問の動的生成 ---
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
                        <label for="${inputId}" class="block cursor-pointer px-3 py-2 md:px-5 md:py-3 border border-gray-300 rounded-lg text-center text-sm md:text-base font-medium text-gray-700 hover:bg-gray-100 transition duration-200">
                            ${opt.text}
                        </label>
                    </div>
                `;
            });

            html += `</div></fieldset>`;
        });
        questionsContainer.innerHTML = html;
    }

    // --- 3. 計算ロジック ---

    // 総合スコアのレベル判定
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

    // アドバイス生成ロジック（7パターン）
    function getAdvice(scoreDA, scoreDD, scoreEE) {
        const isHighDA = scoreDA > FACTOR1_MEAN;
        const isHighDD = scoreDD > FACTOR2_MEAN;
        const isHighEE = scoreEE > FACTOR3_MEAN;

        let advice = "";

        if (isHighDA && isHighDD && isHighEE) {
            advice = "デジタル疲労・依存的不安・情緒的ストレスが同時に高い“総合的負荷”タイプです。いきなりやめるより、短いオフ時間を安全に積み重ねて心と脳の回復を優先するのが効果的です。";
        } else if (isHighDA && isHighDD) {
            advice = "疲労＋依存傾向の両方が高いタイプです。急なデジタル断ちは逆効果になる可能性があります。";
        } else if (isHighDA && isHighEE) {
            advice = "疲労＋心の消耗がセットで悪化しやすいタイプです。集中的な休息を優先しましょう。";
        } else if (isHighDD && isHighEE) {
            advice = "不安＋ストレスが組み合わさるため、デジタルとの境界線を作ることが鍵となります。";
        } else if (isHighDA) {
            advice = "25–30分作業 → 5分休憩など、疲労のメイン原因がデジタル機器を「使いすぎ」のタイプです。作業サイクルを見直しましょう。";
        } else if (isHighDD) {
            advice = "デジタル断ちへの不安が中心です。短いデジタルデトックス習慣が改善に効くでしょう。";
        } else if (isHighEE) {
            advice = "人間関係や通知に疲れたタイプです。心の休息を優先させましょう。";
        } else {
            advice = "現在のところ、各因子のスコアは平均を下回っており、バランスの取れた状態です。";
        }

        return advice;
    }

    // 結果の計算と表示
    function calculateAndShowResults(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const answers = [];
        
        // バリデーション
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

        // スコア計算
        let totalScore = 0;
        let scoreFactor1 = 0; // DA
        let scoreFactor2 = 0; // DD
        let scoreFactor3 = 0; // EE

        answers.forEach((answer, index) => {
            totalScore += answer;
            const factor = questions[index].factor;
            if (factor === 1) {
                scoreFactor1 += answer;
            } else if (factor === 2) {
                scoreFactor2 += answer;
            } else if (factor === 3) {
                scoreFactor3 += answer;
            }
        });

        // レベル判定
        const levelInfo = getLevel(totalScore);
        const adviceText = getAdvice(scoreFactor1, scoreFactor2, scoreFactor3);

        // 総合スコア表示
        document.getElementById('totalScoreDisplay').textContent = totalScore;
        document.getElementById('levelDisplay').textContent = levelInfo.level;
        document.getElementById('levelDescription').textContent = levelInfo.description;

        // アドバイス表示
        adviceTextElement.textContent = adviceText;
        adviceSection.classList.remove('hidden');

        // 下位尺度スコア
        document.getElementById('factor1Score').textContent = scoreFactor1;
        document.getElementById('factor1Mean').textContent = FACTOR1_MEAN.toFixed(2);

        document.getElementById('factor2Score').textContent = scoreFactor2;
        document.getElementById('factor2Mean').textContent = FACTOR2_MEAN.toFixed(2);

        document.getElementById('factor3Score').textContent = scoreFactor3;
        document.getElementById('factor3Mean').textContent = FACTOR3_MEAN.toFixed(2);

        // バーの幅更新
        setTimeout(() => {
            document.getElementById('factor1Bar').style.width = `${(scoreFactor1 / 55) * 100}%`;
            document.getElementById('factor2Bar').style.width = `${(scoreFactor2 / 20) * 100}%`;
            document.getElementById('factor3Bar').style.width = `${(scoreFactor3 / 15) * 100}%`;
        }, 100);

        // フォーム非表示、結果表示
        form.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // リセット処理
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

    // イベントリスナー
    form.addEventListener('submit', calculateAndShowResults);
    resetButton.addEventListener('click', resetForm);

    // 初期化
    renderQuestions();
});
