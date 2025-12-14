window.onload = function() {
    // אלמנטים קיימים
    const form = document.getElementById('calorie-form');
    const calculateBtn = document.getElementById('calculate-btn'); 
    const resetBtn = document.getElementById('reset-btn');
    const resultsDiv = document.getElementById('results');
    const errorMessage = document.getElementById('error-message');
    const warningMessageDiv = document.getElementById('warning-message');
    const warningText = document.getElementById('warning-text');
    const goalTypeSelect = document.getElementById('goal-type');
    const customGoalContainer = document.getElementById('custom-goal-container');
    const macroSplitSelect = document.getElementById('macro-split');
    const customMacroContainer = document.getElementById('custom-macro-container');
    const saveCalculationBtn = document.getElementById('save-calculation-btn');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const openHistoryBtn = document.getElementById('open-history-btn');
    const historySection = document.getElementById('history-section');
    const historyTableBody = document.getElementById('history-table-body');
    const historyClientName = document.getElementById('history-client-name');
    const historyMessage = document.getElementById('history-message');
    const bmiRecommendationDiv = document.getElementById('bmi-recommendation'); // חדש
    const customGpkContainer = document.getElementById('custom-gpk-container'); // חדש

    // אלמנטים חדשים ל-CMS
    const clientNameInput = document.getElementById('client-name');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const loadProfileBtn = document.getElementById('load-profile-btn');
    const newClientBtn = document.getElementById('new-client-btn');
    const clientListSelect = document.getElementById('client-list');
    const clientListContainer = document.getElementById('client-list-container');
    const openAboutModalBtn = document.getElementById('open-about-modal-btn'); // חדש

    
    let currentClient = null;

    // ====================================================================
    // 1. לוגיקת CMS (ניהול לקוחות מקומי)
    // ====================================================================

    function getClients() {
        return JSON.parse(localStorage.getItem('clients')) || {};
    }

    function updateClientList() {
        const clients = getClients();
        clientListSelect.innerHTML = '';
        const clientNames = Object.keys(clients).sort();
        
        if (clientNames.length > 0) {
            clientListContainer.classList.remove('hidden');
            clientNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                clientListSelect.appendChild(option);
            });
            if (currentClient && clients[currentClient]) {
                 clientListSelect.value = currentClient;
            }
        } else {
            clientListContainer.classList.add('hidden');
        }
    }

    function saveProfile(clientName) {
        if (!clientName) return;

        // 1. שמירת נתוני הקלט
        const profileData = {
            gender: document.getElementById('gender').value,
            weight: parseFloat(document.getElementById('weight').value) || '',
            height: parseFloat(document.getElementById('height').value) || '',
            age: parseInt(document.getElementById('age').value) || '',
            bodyFat: parseFloat(document.getElementById('body-fat').value) || '',
            activity: document.getElementById('activity').value,
            goalType: goalTypeSelect.value,
            customGoal: parseFloat(document.getElementById('custom-goal').value) || '',
            macroSplit: macroSplitSelect.value,
            customP: parseFloat(document.getElementById('custom-p-percent').value) || '',
            customF: parseFloat(document.getElementById('custom-f-percent').value) || '',
            customC: parseFloat(document.getElementById('custom-c-percent').value) || '',
            customPgpk: parseFloat(document.getElementById('custom-p-gpk').value) || '', // חדש
            customFgpk: parseFloat(document.getElementById('custom-f-gpk').value) || '', // חדש
        };

        const clients = getClients();
        clients[clientName] = clients[clientName] || {};
        clients[clientName].profile = profileData;
        localStorage.setItem('clients', JSON.stringify(clients));
        
        currentClient = clientName;
        clientNameInput.value = clientName;
        updateClientList();
        // אין צורך באלרט על כל חישוב, רק על שמירה ידנית אם רוצים
        // alert(`פרופיל הלקוח "${clientName}" נשמר בהצלחה!`); 
    }

    function loadProfile(clientName) {
        const clients = getClients();
        const client = clients[clientName];

        if (!client || !client.profile) {
            alert(`שם הלקוח "${clientName}" לא נמצא או שאין לו פרופיל שמור.`);
            return;
        }

        const profile = client.profile;
        document.getElementById('client-name').value = clientName;
        document.getElementById('gender').value = profile.gender;
        document.getElementById('weight').value = profile.weight;
        document.getElementById('height').value = profile.height;
        document.getElementById('age').value = profile.age;
        document.getElementById('body-fat').value = profile.bodyFat;
        document.getElementById('activity').value = profile.activity;
        
        goalTypeSelect.value = profile.goalType;
        toggleCustomGoalInput();
        document.getElementById('custom-goal').value = profile.customGoal;

        macroSplitSelect.value = profile.macroSplit;
        toggleCustomMacroInputs();
        document.getElementById('custom-p-percent').value = profile.customP;
        document.getElementById('custom-f-percent').value = profile.customF;
        document.getElementById('custom-c-percent').value = profile.customC;
        document.getElementById('custom-p-gpk').value = profile.customPgpk; // חדש
        document.getElementById('custom-f-gpk').value = profile.customFgpk; // חדש

        currentClient = clientName;
        resetCalculator(); 
        displayClientHistory();
        alert(`פרופיל הלקוח "${clientName}" נטען בהצלחה.`);
    }

    function newClient() {
        currentClient = null;
        clientNameInput.value = '';
        resetCalculator();
        historySection.classList.add('hidden');
        alert('הכנה לפרופיל לקוח חדש. אנא הזן שם והתחל חישוב.');
    }

    // ====================================================================
    // 2. פונקציות עזר לחישובים (מעודכן: BMI והמלצות)
    // ====================================================================

    function calculateMifflinBMR(gender, weight, height, age) {
        if (gender === 'male') {
            return (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
    }

    function calculateKatchBMR(weight, bodyFatPercent) {
        const BF = bodyFatPercent / 100; 
        const LBM = weight * (1 - BF); 
        return 370 + (21.6 * LBM);
    }

    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        high: 1.725,
        extreme: 1.9
    };

    function calculateBMI(weight, height) {
        const heightMeters = height / 100;
        return weight / (heightMeters * heightMeters);
    }

    function getBMICategory(bmi) {
        if (bmi < 18.5) return 'תת משקל';
        if (bmi < 25) return 'משקל תקין';
        if (bmi < 30) return 'עודף משקל';
        if (bmi < 35) return 'השמנה דרגה I';
        if (bmi < 40) return 'השמנה דרגה II';
        return 'השמנת יתר חולנית (דרגה III)';
    }

    function getBMIRecommendation(bmi, category) {
        let text = `מדד BMI של הלקוח: ${category}.`;
        if (bmi < 18.5) {
            text += ' במצב של תת-משקל, מומלץ להתמקד בעלייה במשקל ובמסת שריר בצורה מבוקרת ומאוזנת.';
        } else if (bmi < 25) {
            text += ' מצב תקין. ניתן להתמקד בשיפור הרכב הגוף (ירידת שומן/עליית שריר) באמצעות תזונה מדויקת ויעדי קלוריות מתאימים.';
        } else if (bmi >= 25 && bmi < 30) {
            text += ' במצב של עודף משקל, מומלץ לשקול גירעון קלורי מתון (250-500 קלוריות) לטובת ירידה בריאה במשקל.';
        } else if (bmi >= 30) {
            text += ' במצב של השמנה, נדרשת תוכנית תזונה מותאמת וגירעון קלורי משמעותי יותר (500-750 קלוריות) תוך מעקב רפואי וליווי מקצועי.';
        }
        return text;
    }

    // ====================================================================
    // 3. לוגיקת חישוב מאקרו (מעודכן: תמיכה בגרם/ק"ג)
    // ====================================================================

    function calculateTargetCalories(tdee, goalType, customGoal) {
        if (goalType === 'custom') {
            return parseFloat(customGoal) || tdee;
        }
        
        let adjustment = 0;
        switch (goalType) {
            case 'deficit_light': adjustment = -250; break;
            case 'deficit_medium': adjustment = -500; break;
            case 'deficit_high': adjustment = -750; break;
            case 'surplus_medium': adjustment = 250; break;
            case 'surplus_high': adjustment = 500; break;
            case 'maintenance': 
            default: adjustment = 0; break;
        }

        let targetCalories = tdee + adjustment;
        return Math.max(targetCalories, 1200); 
    }

    function calculateMacros(targetCalories, macroSplitType, weight) {
        let protein_g, fat_g, carbs_g;
        let p_percent, f_percent, c_percent;
        
        // --- 1. חישוב לפי אחוזים (אופציות רגילות וקאסטום %) ---
        if (macroSplitType === 'custom_p' || macroSplitType === 'default_p' || macroSplitType === 'keto') {
            
            if (macroSplitType === 'custom_p') {
                const customP = parseFloat(document.getElementById('custom-p-percent').value);
                const customF = parseFloat(document.getElementById('custom-f-percent').value);
                const customC = parseFloat(document.getElementById('custom-c-percent').value);

                if (customP + customF + customC < 95 || customP + customF + customC > 105) {
                    errorMessage.textContent = 'שגיאה: סך אחוזי המאקרו המותאמים אישית חייב להיות קרוב ל-100 (בין 95 ל-105).';
                    errorMessage.classList.remove('hidden');
                    return null;
                }
                p_percent = customP / 100;
                f_percent = customF / 100;
                c_percent = customC / 100;

            } else if (macroSplitType === 'keto') {
                p_percent = 0.30;
                f_percent = 0.60;
                c_percent = 0.10;
            } else {
                p_percent = 0.35;
                f_percent = 0.25;
                c_percent = 0.40;
            }

            // המרה מקלוריות לגרמים
            protein_g = (targetCalories * p_percent) / 4;
            fat_g = (targetCalories * f_percent) / 9;
            carbs_g = (targetCalories * c_percent) / 4;
            
        } 
        
        // --- 2. חישוב לפי גרם לק"ג (אופציה מקצועית) ---
        else if (macroSplitType === 'custom_gpk') {
            const p_gpk = parseFloat(document.getElementById('custom-p-gpk').value);
            const f_gpk = parseFloat(document.getElementById('custom-f-gpk').value);
            
            if (!p_gpk || !f_gpk) {
                 errorMessage.textContent = 'שגיאה: יש להזין ערכי חלבון ושומן בגרם/ק"ג.';
                 errorMessage.classList.remove('hidden');
                 return null;
            }
            
            // חישוב גרמים קבועים
            protein_g = p_gpk * weight;
            fat_g = f_gpk * weight;
            
            // חישוב קלוריות של חלבון ושומן
            const p_cal = protein_g * 4;
            const f_cal = fat_g * 9;
            
            // חישוב פחמימה כהשלמה לשאר הקלוריות
            const remaining_cal = targetCalories - p_cal - f_cal;

            if (remaining_cal < 0) {
                 errorMessage.textContent = `שגיאה: יעד הקלוריות היומי ( ${targetCalories} ) נמוך מדי עבור יעד החלבון והשומן שהוגדר ( ${Math.round(p_cal + f_cal)} קלוריות). אנא הגדל את יעד הקלוריות.`;
                 errorMessage.classList.remove('hidden');
                 return null;
            }
            
            carbs_g = remaining_cal / 4;
            
            // חישוב אחוזים (לצורך הצגה בדוח)
            p_percent = (p_cal / targetCalories) * 100;
            f_percent = (f_cal / targetCalories) * 100;
            c_percent = (remaining_cal / targetCalories) * 100;
        }

        return {
            protein_g: protein_g,
            fat_g: fat_g,
            carbs_g: carbs_g,
            p_percent: p_percent,
            f_percent: f_percent,
            c_percent: c_percent,
        };
    }

    // ====================================================================
    // 4. פונקציית תצוגה
    // ====================================================================

    function displayResults(data, prefix) {
        document.getElementById(`${prefix}-result-macro`).textContent = Math.round(data.targetCalories);
        document.getElementById(`${prefix}-result`).textContent = Math.round(data.targetCalories) + ' קלוריות';
        document.getElementById(`${prefix}-tdee-result`).textContent = Math.round(data.tdee);

        if (data.macros) {
            document.getElementById(`${prefix}_p_g`).textContent = Math.round(data.macros.protein_g);
            document.getElementById(`${prefix}_f_g`).textContent = Math.round(data.macros.fat_g);
            document.getElementById(`${prefix}_c_g`).textContent = Math.round(data.macros.carbs_g);
            document.getElementById(`${prefix}_p_p`).textContent = data.macros.p_percent.toFixed(1) + '%';
            document.getElementById(`${prefix}_f_p`).textContent = data.macros.f_percent.toFixed(1) + '%';
            document.getElementById(`${prefix}_c_p`).textContent = data.macros.c_percent.toFixed(1) + '%';
        }
    }

    function calculateAndDisplayResults(e) {
        if (e) e.preventDefault();
        
        // איפוס
        errorMessage.classList.add('hidden');
        warningMessageDiv.classList.add('hidden');
        resultsDiv.classList.add('hidden');
        bmiRecommendationDiv.classList.add('hidden');
        
        const clientName = clientNameInput.value.trim();
        if (!clientName) {
            errorMessage.textContent = 'אנא הזן שם לקוח לפני החישוב.';
            errorMessage.classList.remove('hidden');
            return;
        }

        const gender = document.getElementById('gender').value;
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const age = parseInt(document.getElementById('age').value);
        const bodyFatPercent = parseFloat(document.getElementById('body-fat').value);
        const activity = document.getElementById('activity').value;
        const goalType = goalTypeSelect.value;
        const customGoal = document.getElementById('custom-goal').value;
        const macroSplitType = macroSplitSelect.value;
        
        if (!weight || !height || !age || !activity) {
            errorMessage.textContent = 'אנא מלא את כל שדות החובה (משקל, גובה, גיל, פעילות).';
            errorMessage.classList.remove('hidden');
            return;
        }

        // 1. חישוב BMI
        const bmi = calculateBMI(weight, height);
        const bmiCategory = getBMICategory(bmi);
        document.getElementById('bmi-result').textContent = `${bmi.toFixed(2)} (${bmiCategory})`;
        bmiRecommendationDiv.textContent = getBMIRecommendation(bmi, bmiCategory);
        bmiRecommendationDiv.classList.remove('hidden');

        // 2. חישוב Mifflin (בסיס)
        const mifflinBMR = calculateMifflinBMR(gender, weight, height, age);
        const mifflinTDEE = mifflinBMR * activityMultipliers[activity];
        const mifflinTargetCalories = calculateTargetCalories(mifflinTDEE, goalType, customGoal);
        const mifflinMacros = calculateMacros(mifflinTargetCalories, macroSplitType, weight);
        
        if (!mifflinMacros) return; // עצור אם הייתה שגיאת מאקרו מותאם אישית/גרם/ק"ג

        document.getElementById('m-bmr-result').textContent = Math.round(mifflinBMR);
        document.getElementById('m-tdee-result').textContent = Math.round(mifflinTDEE);
        
        displayResults({
            tdee: mifflinTDEE, 
            targetCalories: mifflinTargetCalories, 
            macros: mifflinMacros
        }, 'm');


        // 3. חישוב Katch-McArdle (אם יש אחוז שומן)
        if (bodyFatPercent >= 1 && bodyFatPercent <= 60) {
            const katchBMR = calculateKatchBMR(weight, bodyFatPercent);
            const katchTDEE = katchBMR * activityMultipliers[activity];
            const katchTargetCalories = calculateTargetCalories(katchTDEE, goalType, customGoal);
            const katchMacros = calculateMacros(katchTargetCalories, macroSplitType, weight);

            if (!katchMacros) return; // עצור אם הייתה שגיאת מאקרו מותאם אישית/גרם/ק"ג

            document.getElementById('k-bmr-result').textContent = Math.round(katchBMR);
            document.getElementById('katch-header').classList.remove('hidden');
            document.getElementById('katch-row').classList.remove('hidden');
            
            displayResults({
                tdee: katchTDEE, 
                targetCalories: katchTargetCalories, 
                macros: katchMacros
            }, 'k');

            // הודעת אזהרה אם ה-BMR שונה משמעותית
            const diff = Math.abs(mifflinBMR - katchBMR);
            if (diff > 250) {
                warningText.innerHTML = `**אזהרה:** קיים פער משמעותי של ${Math.round(diff)} קלוריות בין חישובי BMR. מומלץ לוודא את דיוק אחוז השומן.`;
                warningMessageDiv.classList.remove('hidden');
            }

        } else {
            document.getElementById('katch-header').classList.add('hidden');
            document.getElementById('katch-row').classList.add('hidden');
        }
        
        // 4. חישוב יעד שבועי משוער (חדש)
        const weeklyCalorieDifference = (mifflinTargetCalories - mifflinTDEE) * 7; // הבדל קלורי שבועי
        const weeklyFatChangeGrams = weeklyCalorieDifference / 7700 * 1000; // 7700 קלוריות = 1 ק"ג שומן
        
        let goalText;
        if (weeklyFatChangeGrams > 0) {
            goalText = `צפי לעלייה: ${weeklyFatChangeGrams.toFixed(1)} גרם שומן בשבוע (0.${Math.abs(weeklyFatChangeGrams / 10).toFixed(1)} ק"ג בשבוע)`;
        } else if (weeklyFatChangeGrams < 0) {
            goalText = `צפי לירידה: ${Math.abs(weeklyFatChangeGrams).toFixed(1)} גרם שומן בשבוע (0.${Math.abs(weeklyFatChangeGrams / 10).toFixed(1)} ק"ג בשבוע)`;
        } else {
            goalText = 'שמירה על משקל (תחזוקה קלורית)';
        }
        document.getElementById('weekly-goal-result').textContent = goalText;


        // 5. הצגת התוצאות
        resultsDiv.classList.remove('hidden');
        currentClient = clientName;
        saveProfile(clientName); 
    }

    function resetCalculator() {
        form.reset();
        resultsDiv.classList.add('hidden');
        errorMessage.classList.add('hidden');
        warningMessageDiv.classList.add('hidden');
        historySection.classList.add('hidden');
        bmiRecommendationDiv.classList.add('hidden');
        
        document.getElementById('m-bmr-result').textContent = '--';
        document.getElementById('k-bmr-result').textContent = '--';
        document.getElementById('m-tdee-result').textContent = '--';
        document.getElementById('k-tdee-result').textContent = '--';
        document.getElementById('bmi-result').textContent = '--';
        document.getElementById('weekly-goal-result').textContent = '--';

        const prefixes = ['m', 'k'];
        prefixes.forEach(prefix => {
            document.getElementById(`${prefix}-result`).textContent = '--';
            document.getElementById(`${prefix}-result-macro`).textContent = '--';
            document.getElementById(`${prefix}_p_g`).textContent = '--';
            document.getElementById(`${prefix}_f_g`).textContent = '--';
            document.getElementById(`${prefix}_c_g`).textContent = '--';
            document.getElementById(`${prefix}_p_p`).textContent = '--';
            document.getElementById(`${prefix}_f_p`).textContent = '--';
            document.getElementById(`${prefix}_c_p`).textContent = '--';
        });

        customGoalContainer.classList.add('hidden');
        customMacroContainer.classList.add('hidden');
        customGpkContainer.classList.add('hidden');
    }

    // ====================================================================
    // 5. לוגיקת היסטוריה ודוחות
    // ====================================================================

    function saveCalculationToHistory() {
        if (!currentClient || resultsDiv.classList.contains('hidden')) {
            alert('יש לבצע חישוב ולטעון לקוח לפני שמירה להיסטוריה.');
            return;
        }

        const clients = getClients();
        const clientData = clients[currentClient] || {};
        clientData.history = clientData.history || [];

        const calculationData = {
            date: new Date().toLocaleDateString('he-IL'),
            weight: parseFloat(document.getElementById('weight').value),
            bodyFat: parseFloat(document.getElementById('body-fat').value) || 'אין',
            tdee: Math.round(parseFloat(document.getElementById('m-tdee-result').textContent)) || '--',
            targetCalories: Math.round(parseFloat(document.getElementById('m-result-macro').textContent)) || '--',
            macroSplit: {
                P: document.getElementById('m_p_g').textContent,
                F: document.getElementById('m_f_g').textContent,
                C: document.getElementById('m_c_g').textContent,
            }
        };

        clientData.history.unshift(calculationData);
        clients[currentClient] = clientData;
        localStorage.setItem('clients', JSON.stringify(clients));
        displayClientHistory();
        alert(`חישוב עבור ${currentClient} נשמר בהצלחה בהיסטוריה!`);
    }
    
    function displayClientHistory() {
        historySection.classList.remove('hidden');
        historyClientName.textContent = currentClient;
        historyTableBody.innerHTML = '';
        historyMessage.classList.add('hidden');

        const clients = getClients();
        const clientData = clients[currentClient];

        if (!clientData || !clientData.history || clientData.history.length === 0) {
            historyMessage.classList.remove('hidden');
            document.querySelector('.history-table').classList.add('hidden');
            return;
        }
        
        document.querySelector('.history-table').classList.remove('hidden');
        clientData.history.forEach(item => {
            const row = historyTableBody.insertRow();
            row.innerHTML = `
                <td>${item.date}</td>
                <td>${item.weight}</td>
                <td>${item.bodyFat}</td>
                <td>${item.tdee}</td>
                <td class="highlight-result">${item.targetCalories}</td>
                <td>${item.macroSplit.P}ג / ${item.macroSplit.F}ג / ${item.macroSplit.C}ג</td>
            `;
        });
    }

    function generateReport() {
        if (!currentClient || resultsDiv.classList.contains('hidden')) {
            alert('יש לבצע חישוב לפני יצירת דוח מקצועי.');
            return;
        }

        const reportOutput = document.getElementById('report-output');
        const mResults = document.getElementById('m-result-macro').textContent;
        const mMacros = {
            p: document.getElementById('m_p_g').textContent,
            f: document.getElementById('m_f_g').textContent,
            c: document.getElementById('m_c_g').textContent,
            pp: document.getElementById('m_p_p').textContent,
            fp: document.getElementById('m_f_p').textContent,
            cp: document.getElementById('m_c_p').textContent,
        };
        const bmiResult = document.getElementById('bmi-result').textContent;
        const weeklyGoalResult = document.getElementById('weekly-goal-result').textContent; // חדש
        const bmiRecommendation = document.getElementById('bmi-recommendation').textContent; // חדש

        const reportHTML = `
            <div class="report-header" style="border-bottom: 3px solid #00c6ff; padding-bottom: 10px; margin-bottom: 20px;">
                <h3 style="color: #00c6ff;">דוח תזונה רשמי: ${currentClient}</h3>
                <p><strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
                <p><strong>מאמן/ת:</strong> [שם המאמן שלך]</p>
            </div>
            
            <div class="report-section">
                <h4>נתוני לקוח ובריאות</h4>
                <ul>
                    <li><strong>גיל:</strong> ${document.getElementById('age').value}</li>
                    <li><strong>משקל:</strong> ${document.getElementById('weight').value} ק"ג</li>
                    <li><strong>גובה:</strong> ${document.getElementById('height').value} ס"מ</li>
                    <li><strong>אחוז שומן:</strong> ${document.getElementById('body-fat').value || 'לא הוזן'}</li>
                    <li><strong>BMI:</strong> ${bmiResult}</li>
                </ul>
                <p style="margin-top: 10px; font-weight: bold;">${bmiRecommendation}</p>
            </div>

            <div class="report-section">
                <h4>סיכום חישובים</h4>
                <p><strong>BMR (חילוף חומרים בסיסי):</strong> ${document.getElementById('m-bmr-result').textContent} קלוריות</p>
                <p><strong>TDEE (קלוריות תחזוקה):</strong> ${document.getElementById('m-tdee-result').textContent} קלוריות</p>
                <p style="font-weight: bold; margin-top: 10px; color: #f1c40f;">**יעד שבועי משוער:** ${weeklyGoalResult}</p>
            </div>

            <div class="report-section highlight-target">
                <h4 style="color: #00c6ff;">יעד קלורי ומאקרו</h4>
                <p style="font-size: 1.2em; font-weight: bold;">יעד קלורי יומי: ${mResults} קלוריות</p>
                <p>חלוקת המאקרו היומית המומלצת שלך (בגרמים ובאחוזים):</p>
                <ul>
                    <li><strong>חלבון:</strong> ${mMacros.p} גרם (${mMacros.pp})</li>
                    <li><strong>שומן:</strong> ${mMacros.f} גרם (${mMacros.fp})</li>
                    <li><strong>פחמימה:</strong> ${mMacros.c} גרם (${mMacros.cp})</li>
                </ul>
            </div>
            <p class="footer-note" style="margin-top: 30px; font-size: 0.9em; color: #95a5a6;">*הדוח מבוסס על נוסחת Mifflin-St Jeor ורמת הפעילות שהוזנה. מומלץ לוודא נתונים אלו.</p>
        `;
        
        reportOutput.innerHTML = reportHTML;
        document.getElementById('share-modal-container').classList.remove('hidden');
    }
    
    function printReport() {
        const printContent = document.getElementById('report-output').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>דוח תזונה</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: 'Rubik', sans-serif; direction: rtl; padding: 20px; color: #333; }
            .report-header { border-bottom: 3px solid #0072ff; padding-bottom: 10px; margin-bottom: 20px; }
            .report-header h3 { color: #0072ff; }
            .report-section { margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
            .highlight-target { background-color: #f0f8ff; border-left: 5px solid #00c6ff; }
            .highlight-target p { margin: 5px 0; }
            .footer-note { font-size: 0.8em; color: #777; }
            ul { list-style-type: none; padding-right: 0; }
            ul li { margin-bottom: 5px; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
             printWindow.print();
             printWindow.close();
        }, 500);
    }
    
    // ====================================================================
    // 6. אירועי UI וטוגלים
    // ====================================================================

    function toggleCustomGoalInput() {
        if (goalTypeSelect.value === 'custom') {
            customGoalContainer.classList.remove('hidden');
        } else {
            customGoalContainer.classList.add('hidden');
        }
    }
    
    function toggleCustomMacroInputs() {
        // מסתיר את כל האפשרויות המותאמות אישית
        customMacroContainer.classList.add('hidden');
        customGpkContainer.classList.add('hidden');
        
        if (macroSplitSelect.value === 'custom_p') {
            customMacroContainer.classList.remove('hidden');
        } else if (macroSplitSelect.value === 'custom_gpk') {
            customGpkContainer.classList.remove('hidden');
        }
    }

    // אירועי טופס וכפתורים
    calculateBtn.addEventListener('click', calculateAndDisplayResults);
    resetBtn.addEventListener('click', resetCalculator);
    
    // אירועי CMS
    saveProfileBtn.addEventListener('click', () => saveProfile(clientNameInput.value.trim()));
    loadProfileBtn.addEventListener('click', () => loadProfile(clientListSelect.value));
    newClientBtn.addEventListener('click', newClient);
    clientListSelect.addEventListener('change', () => loadProfile(clientListSelect.value));
    
    // אירועי גמישות בחישוב
    goalTypeSelect.addEventListener('change', toggleCustomGoalInput);
    macroSplitSelect.addEventListener('change', toggleCustomMacroInputs);
    
    // אירועי דוח והיסטוריה
    saveCalculationBtn.addEventListener('click', saveCalculationToHistory);
    openHistoryBtn.addEventListener('click', displayClientHistory);
    generateReportBtn.addEventListener('click', generateReport);
    document.getElementById('print-report-btn').addEventListener('click', printReport);


    // לוגיקת המודאל
    const modalContainer = document.getElementById('modal-container');
    const activityCloseBtn = document.getElementById('activity-close-btn');
    const aboutModalContainer = document.getElementById('about-modal-container');
    const aboutCloseBtn = document.getElementById('about-close-btn');
    const shareModalContainer = document.getElementById('share-modal-container');
    const shareCloseBtn = document.getElementById('share-close-btn');
    const activityInfoBtn = document.getElementById('activity-info-btn');

    // פתיחת מודאל ה'אודות' מתוך הקרדיטים (בפוטר)
    openAboutModalBtn.addEventListener('click', function(e) { e.preventDefault(); aboutModalContainer.classList.remove('hidden'); });

    // פתיחת מודאל הפעילות מתוך דף ה'אודות'
    activityInfoBtn.addEventListener('click', function(e) { 
        e.preventDefault(); 
        aboutModalContainer.classList.add('hidden'); 
        modalContainer.classList.remove('hidden'); 
    });

    activityCloseBtn.addEventListener('click', function() { modalContainer.classList.add('hidden'); });
    aboutCloseBtn.addEventListener('click', function() { aboutModalContainer.classList.add('hidden'); });
    shareCloseBtn.addEventListener('click', function() { shareModalContainer.classList.add('hidden'); });

    // סגירת מודאל בלחיצה מחוץ
    window.onclick = function(event) {
        if (event.target === modalContainer) { modalContainer.classList.add('hidden'); }
        if (event.target === aboutModalContainer) { aboutModalContainer.classList.add('hidden'); }
        if (event.target === shareModalContainer) { shareModalContainer.classList.add('hidden'); }
    }
    
    // טעינה ראשונית
    updateClientList();
};