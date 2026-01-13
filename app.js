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

            // チャート用変数
            let radarChart = null;

            // --- 2. 質問の動的生成 ---
            function renderQuestions() {
                let html = '';
                questions.forEach((q, index) => {
                    // IDやname属性の設定。name属性は質問ごとに一意(q0, q1...)
                    html += `<fieldset class="border border-gray-200 rounded-lg p-5 shadow-sm transition-all duration-300">`;
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

                // --- 自動スクロール機能の追加 ---
                const radioButtons = questionsContainer.querySelectorAll('input[type="radio"]');
                radioButtons.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        // 現在の質問(fieldset)と次の質問を取得
                        const currentFieldset = e.target.closest('fieldset');
                        const nextFieldset = currentFieldset.nextElementSibling;
                        
                        // 選択時の余韻として少し待ってからスクロール (300ms)
                        setTimeout(() => {
                            if (nextFieldset) {
                                nextFieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            } else {
                                // 最後の質問の場合は送信ボタンへスクロール
                                const submitBtn = document.querySelector('button[type="submit"]');
                                if(submitBtn) {
                                    submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }
                        }, 300);
                    });
                });
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

            // アドバイス生成ロジック
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

            // チャート描画関数
            function drawRadarChart(daScore, ddScore, eeScore) {
                const ctx = document.getElementById('radarChart').getContext('2d');
                
                // 満点
                const maxDA = 55;
                const maxDD = 20;
                const maxEE = 15;

                // 得点率(%)に換算
                const daPercent = (daScore / maxDA) * 100;
                const ddPercent = (ddScore / maxDD) * 100;
                const eePercent = (eeScore / maxEE) * 100;

                // 平均の得点率
                const daMeanPercent = (FACTOR1_MEAN / maxDA) * 100;
                const ddMeanPercent = (FACTOR2_MEAN / maxDD) * 100;
                const eeMeanPercent = (FACTOR3_MEAN / maxEE) * 100;

                if (radarChart) {
                    radarChart.destroy();
                }

                radarChart = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: ['DA', 'DD', 'EE'], // ラベルを略称に変更済
                        datasets: [{
                            label: 'あなたのスコア',
                            data: [daPercent, ddPercent, eePercent],
                            backgroundColor: 'rgba(59, 130, 246, 0.4)', // blue-500 with opacity
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
                        }, {
                            label: '平均 (N=231)',
                            data: [daMeanPercent, ddMeanPercent, eeMeanPercent],
                            backgroundColor: 'rgba(156, 163, 175, 0.2)', // gray-400 with opacity
                            borderColor: 'rgba(156, 163, 175, 1)',
                            borderWidth: 2,
                            borderDash: [5, 5], // 点線
                            pointRadius: 0 // 平均の点は表示しない
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                angleLines: {
                                    display: true
                                },
                                suggestedMin: 0,
                                suggestedMax: 100, // 0-100%で表示
                                ticks: {
                                    stepSize: 20,
                                    callback: function(value) {
                                        return value + '%'; 
                                    }
                                },
                                pointLabels: {
                                    font: {
                                        size: 14,
                                        family: "'Inter', 'Noto Sans JP', sans-serif",
                                        weight: 'bold'
                                    },
                                    color: '#374151' // gray-700
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    font: {
                                        family: "'Inter', 'Noto Sans JP', sans-serif"
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.dataset.label || '';
                                        const value = context.raw.toFixed(1) + '%';
                                        return `${label}: ${value}`;
                                    }
                                }
                            }
                        }
                    }
                });
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

                // 下位尺度スコア表示
                document.getElementById('factor1Score').textContent = scoreFactor1;
                document.getElementById('factor1Mean').textContent = FACTOR1_MEAN.toFixed(2);

                document.getElementById('factor2Score').textContent = scoreFactor2;
                document.getElementById('factor2Mean').textContent = FACTOR2_MEAN.toFixed(2);

                document.getElementById('factor3Score').textContent = scoreFactor3;
                document.getElementById('factor3Mean').textContent = FACTOR3_MEAN.toFixed(2);

                // フォーム非表示、結果表示
                form.classList.add('hidden');
                resultsDiv.classList.remove('hidden');

                // レーダーチャート描画
                // 画面描画のタイミングに合わせて実行
                requestAnimationFrame(() => {
                    drawRadarChart(scoreFactor1, scoreFactor2, scoreFactor3);
                });

                resultsDiv.scrollIntoView({ behavior: 'smooth' });
            }

            // リセット処理
            function resetForm() {
                form.reset();
                resultsDiv.classList.add('hidden');
                errorMessage.classList.add('hidden');
                adviceSection.classList.add('hidden');
                form.classList.remove('hidden');

                // チャート破棄
                if (radarChart) {
                    radarChart.destroy();
                    radarChart = null;
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // イベントリスナー
            form.addEventListener('submit', calculateAndShowResults);
            resetButton.addEventListener('click', resetForm);

            // 初期化
            renderQuestions();
        });
