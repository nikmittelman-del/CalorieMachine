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
    const bmiRecommendationDiv = document.getElementById('bmi-recommendation');
    const customGpkContainer = document.getElementById('custom-gpk-container');

    // אלמנטים חדשים ל-CMS
    const clientNameInput = document.getElementById('client-name');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const loadProfileBtn = document.getElementById('load-profile-btn');
    const newClientBtn = document.getElementById('new-client-btn');
    const clientListSelect = document.getElementById('client-list');
    const clientListContainer = document.getElementById('client-list-container');
    const openAboutModalBtn = document.getElementById('open-about-modal-btn');

    // אלמנטים חדשים למודול אימונים
    const trainingSection = document.getElementById('training-section');
    const generateTrainingBtn = document.getElementById('generate-training-plan');
    const viewTipsBtn = document.getElementById('view-tips');
    const trainingPlanDiv = document.getElementById('training-plan');
    const trainingWeekContainer = document.getElementById('training-week-container');
    const addTrainingPlanBtn = document.getElementById('add-training-plan');

    // אלמנטים חדשים למודאלים של טיפים
    const nutritionTipsBtn = document.getElementById('nutrition-tips-btn');
    const trainingTipsBtn = document.getElementById('training-tips-btn');
    const recoveryTipsBtn = document.getElementById('recovery-tips-btn');
    const nutritionTipsModal = document.getElementById('nutrition-tips-modal');
    const trainingTipsModal = document.getElementById('training-tips-modal');
    const recoveryTipsModal = document.getElementById('recovery-tips-modal');
    const nutritionCloseBtn = document.getElementById('nutrition-close-btn');
    const trainingCloseBtn = document.getElementById('training-close-btn');
    const recoveryCloseBtn = document.getElementById('recovery-close-btn');

    let currentClient = null;

    // ====================================================================
    // מאגר תרגילים וטיפים
    // ====================================================================
    const exerciseDatabase = {
        beginner: {
            full_body: [
                { name: "סקוואט", sets: "3", reps: "10-12", rest: "60s" },
                { name: "לחיצת חזה", sets: "3", reps: "10-12", rest: "60s" },
                { name: "מתח/פולי עליון", sets: "3", reps: "8-10", rest: "60s" },
                { name: "פרפרים", sets: "3", reps: "12-15", rest: "45s" },
                { name: "כפיפות בטן", sets: "3", reps: "15-20", rest: "45s" }
            ],
            upper_lower: [
                { name: "דדליפט", sets: "3", reps: "8-10", rest: "90s" },
                { name: "לחיצת כתפיים", sets: "3", reps: "10-12", rest: "60s" },
                { name: "חתירות", sets: "3", reps: "10-12", rest: "60s" },
                { name: "באצ'פר כפיפות מרפקים", sets: "3", reps: "10-12", rest: "45s" },
                { name: "סקוואט בולגרי", sets: "3", reps: "10-12", rest: "60s" }
            ]
        },
        intermediate: {
            push_pull_legs: [
                { name: "סקוואט עם מוט", sets: "4", reps: "8-10", rest: "90s" },
                { name: "לחיצת חזה בשיפוע", sets: "4", reps: "8-10", rest: "75s" },
                { name: "פרנסי פרס", sets: "3", reps: "10-12", rest: "60s" },
                { name: "דדליפט רומני", sets: "4", reps: "8-10", rest: "90s" },
                { name: "חתירה עם מוט", sets: "4", reps: "8-10", rest: "75s" }
            ]
        },
        advanced: {
            advanced_split: [
                { name: "סקוואט כבד", sets: "5", reps: "5-6", rest: "120s" },
                { name: "לחיצת חזה כבדה", sets: "5", reps: "5-6", rest: "120s" },
                { name: "דדליפט כבד", sets: "5", reps: "5-6", rest: "120s" },
                { name: "מתח משקל גוף נוסף", sets: "4", reps: "6-8", rest: "90s" },
                { name: "אימון פליאומטרי", sets: "4", reps: "8-10", rest: "90s" }
            ]
        }
    };

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
            customPgpk: parseFloat(document.getElementById('custom-p-gpk').value) || '',
            customFgpk: parseFloat(document.getElementById('custom-f-gpk').value) || '',
        };

        const clients = getClients();
        clients[clientName] = clients[clientName] || {};
        clients[clientName].profile = profileData;
        localStorage.setItem('clients', JSON.stringify(clients));
        
        currentClient = clientName;
        clientNameInput.value = clientName;
        updateClientList();
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
        document.getElementById('custom-p-gpk').value = profile.customPgpk;
        document.getElementById('custom-f-gpk').value = profile.customFgpk;

        currentClient = clientName;
        resetCalculator();
        displayClientHistory();
        
        // טעינת תכנית אימונים אם קיימת
        if (client.trainingPlan) {
            document.getElementById('training-level').value = client.trainingPlan.level;
            document.getElementById('training-goal').value = client.trainingPlan.goal;
            document.getElementById('training-days').value = client.trainingPlan.days;
            
            // טעינת ציוד
            if (client.trainingPlan.equipment) {
                const equipmentSelect = document.getElementById('available-equipment');
                Array.from(equipmentSelect.options).forEach(option => {
                    option.selected = client.trainingPlan.equipment.includes(option.value);
                });
            }
            
            trainingSection.classList.remove('hidden');
        }
        
        alert(`פרופיל הלקוח "${clientName}" נטען בהצלחה.`);
    }

    function newClient() {
        currentClient = null;
        clientNameInput.value = '';
        resetCalculator();
        trainingSection.classList.add('hidden');
        trainingPlanDiv.classList.add('hidden');
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
        trainingPlanDiv.classList.add('hidden');
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
            alert('יש לבצע חישוב ולטעון לקוח לפני שמירה בהיסטוריה.');
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
        const weeklyGoalResult = document.getElementById('weekly-goal-result').textContent;
        const bmiRecommendation = document.getElementById('bmi-recommendation').textContent;

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
    // 6. פונקציות למודול אימונים
    // ====================================================================

    function generateTrainingPlan() {
        const level = document.getElementById('training-level').value;
        const goal = document.getElementById('training-goal').value;
        const days = parseInt(document.getElementById('training-days').value);
        const equipment = Array.from(document.getElementById('available-equipment').selectedOptions).map(opt => opt.value);
        
        if (!level || !goal || !days) {
            alert('אנא מלא את כל שדות האימון');
            return;
        }
        
        // סגירת חלון התוצאות אם פתוח
        resultsDiv.classList.add('hidden');
        
        // הצגת חלון האימונים
        trainingSection.classList.remove('hidden');
        trainingPlanDiv.classList.remove('hidden');
        
        // יצירת תכנית שבועית
        let planHTML = '';
        const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
        
        for (let i = 0; i < days; i++) {
            planHTML += `
                <div class="training-day">
                    <h4>יום ${dayNames[i]} - ${getDayFocus(goal, i, days)}</h4>
                    <p><strong>עצימות:</strong> ${getIntensity(goal, level)}</p>
                    <p><strong>זמן אימון:</strong> ${getWorkoutTime(level)} דקות</p>
                    <ul class="exercise-list">
                        ${generateExercises(level, goal, i, days, equipment).map(ex => `
                            <li>
                                <span>${ex.name}</span>
                                <span>${ex.sets} סטים × ${ex.reps} חזרות</span>
                            </li>
                        `).join('')}
                    </ul>
                    <p class="tip-text"><strong>טיפ:</strong> ${getDayTip(goal, i)}</p>
                </div>
            `;
        }
        
        trainingWeekContainer.innerHTML = planHTML;
        
        // חישוב סטטיסטיקות
        calculateTrainingStats(days, level);
        
        // שמירה בפרופיל הלקוח
        if (currentClient) {
            saveTrainingPlan(currentClient, { level, goal, days, equipment });
        }
    }

    function calculateTrainingStats(days, level) {
        const timePerDay = level === 'beginner' ? 45 : level === 'intermediate' ? 60 : 75;
        const totalTime = days * timePerDay;
        const caloriesPerMinute = level === 'beginner' ? 7 : level === 'intermediate' ? 8 : 9;
        const totalCalories = totalTime * caloriesPerMinute;
        
        document.getElementById('total-weekly-time').textContent = `${totalTime} דקות`;
        document.getElementById('estimated-calories-burned').textContent = `${Math.round(totalCalories)} קלוריות`;
        document.getElementById('average-intensity').textContent = getIntensityText(level);
    }

    function getDayFocus(goal, dayIndex, totalDays) {
        const focuses = {
            fat_loss: ["אירובי + גפ\"י", "כוח + HIIT", "מעגלים", "אירובי", "גפ\"י", "פעילות חופשית", "מנוחה"],
            muscle_gain: ["חזה + כתפיים", "גב + זרועות", "רגליים", "חזה + זרועות", "גב + כתפיים", "רגליים", "מנוחה"],
            strength: ["לחיצות", "משיכות", "רגליים", "חוזק שרירי ליבה", "אולימפי", "סיבולת", "מנוחה"],
            endurance: ["ריצה ארוכה", "אינטרוולים", "שחייה/אופניים", "ריצה קלה", "אימון מעגלים", "פעילות גמישות", "מנוחה"]
        };
        
        return focuses[goal] ? focuses[goal][dayIndex] : "אימון כללי";
    }

    function generateExercises(level, goal, dayIndex, totalDays, equipment) {
        // לוגיקה פשוטה לדוגמה - במציאות זה יהיה מורכב יותר
        if (level === 'beginner') {
            return exerciseDatabase.beginner.full_body;
        } else if (level === 'intermediate') {
            return exerciseDatabase.intermediate.push_pull_legs;
        } else {
            return exerciseDatabase.advanced.advanced_split;
        }
    }

    function showTips() {
        trainingTipsModal.classList.remove('hidden');
    }

    // פונקציות עזר נוספות
    function getIntensity(goal, level) {
        const intensities = {
            beginner: "בינונית",
            intermediate: "גבוהה",
            advanced: "גבוהה מאוד"
        };
        return intensities[level] || "בינונית";
    }

    function getWorkoutTime(level) {
        const times = {
            beginner: 45,
            intermediate: 60,
            advanced: 75
        };
        return times[level] || 60;
    }

    function getIntensityText(level) {
        const texts = {
            beginner: "בינונית (60-70% מהדופק המרבי)",
            intermediate: "גבוהה (70-80% מהדופק המרבי)",
            advanced: "גבוהה מאוד (80-90% מהדופק המרבי)"
        };
        return texts[level] || texts.beginner;
    }

    function getDayTip(goal, dayIndex) {
        const tips = {
            fat_loss: [
                "שתו תה ירוק לפני האימון להגברת שריפת השומן",
                "נסו אימון בצום בבוקר ליעילות מרבית",
                "הימנעו מפחמימות פשוטות לפני אימוני חיטוב"
            ],
            muscle_gain: [
                "אכלו ארוחה עשירה בחלבון ובפחמימות לאחר האימון",
                "הקפידו על מנוחה של 60-90 שניות בין סטים",
                "התמקדו בצורה נכונה ולא במשקל כבד מדי"
            ]
        };
        
        const goalTips = tips[goal] || tips.fat_loss;
        return goalTips[dayIndex % goalTips.length];
    }

    function saveTrainingPlan(clientName, planData) {
        const clients = getClients();
        if (clients[clientName]) {
            clients[clientName].trainingPlan = {
                ...planData,
                generatedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('clients', JSON.stringify(clients));
        }
    }

    // ====================================================================
    // 7. ניווט ואנימציות
    // ====================================================================

    function scrollToSection(section) {
        let element = null;
        
        switch(section) {
            case 'client':
                element = document.getElementById('client-section');
                break;
            case 'calculator':
                element = document.getElementById('calculator-section');
                break;
            case 'training':
                element = document.getElementById('training-section');
                break;
            case 'results':
                element = document.getElementById('results');
                if (element.classList.contains('hidden')) {
                    alert('יש לבצע חישוב קודם כדי לראות תוצאות.');
                    return;
                }
                break;
            case 'history':
                element = document.getElementById('history-section');
                if (element.classList.contains('hidden') && currentClient) {
                    displayClientHistory();
                } else if (!currentClient) {
                    alert('יש לטעון פרופיל לקוח לפני הצגת היסטוריה.');
                    element = document.getElementById('client-section');
                }
                break;
        }
        
        if (element) {
            // עדכון כפתור פעיל
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-section') === section) {
                    item.classList.add('active');
                }
            });
            
            // גלילה חלקה
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // הדגשה קלה
            const originalBorder = element.style.borderTop;
            element.style.borderTop = '5px solid #ff6a00';
            setTimeout(() => {
                element.style.borderTop = originalBorder;
            }, 1500);
        }
    }

    // ====================================================================
    // 8. אירועי UI וטוגלים
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

    // ====================================================================
    // 9. הגדרת אירועים
    // ====================================================================

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
    
    // אירועי אימונים
    generateTrainingBtn.addEventListener('click', generateTrainingPlan);
    viewTipsBtn.addEventListener('click', showTips);
    addTrainingPlanBtn.addEventListener('click', function() {
        generateTrainingPlan();
        scrollToSection('training');
    });

    // אירועי טיפים מהסרגל
    nutritionTipsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        nutritionTipsModal.classList.remove('hidden');
    });
    
    trainingTipsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        trainingTipsModal.classList.remove('hidden');
    });
    
    recoveryTipsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        recoveryTipsModal.classList.remove('hidden');
    });

    // סגירת מודאלים של טיפים
    nutritionCloseBtn.addEventListener('click', function() {
        nutritionTipsModal.classList.add('hidden');
    });
    
    trainingCloseBtn.addEventListener('click', function() {
        trainingTipsModal.classList.add('hidden');
    });
    
    recoveryCloseBtn.addEventListener('click', function() {
        recoveryTipsModal.classList.add('hidden');
    });

    // לוגיקת המודאל הקיים
    const modalContainer = document.getElementById('modal-container');
    const activityCloseBtn = document.getElementById('activity-close-btn');
    const aboutModalContainer = document.getElementById('about-modal-container');
    const aboutCloseBtn = document.getElementById('about-close-btn');
    const shareModalContainer = document.getElementById('share-modal-container');
    const shareCloseBtn = document.getElementById('share-close-btn');
    const activityInfoBtn = document.getElementById('activity-info-btn');

    // פתיחת מודאל ה'אודות' מתוך הקרדיטים (בפוטר)
    openAboutModalBtn.addEventListener('click', function(e) { 
        e.preventDefault(); 
        aboutModalContainer.classList.remove('hidden'); 
    });

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
        if (event.target === nutritionTipsModal) { nutritionTipsModal.classList.add('hidden'); }
        if (event.target === trainingTipsModal) { trainingTipsModal.classList.add('hidden'); }
        if (event.target === recoveryTipsModal) { recoveryTipsModal.classList.add('hidden'); }
    }
    
    // ניווט עם תפריט הצד - עם תיקון
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const section = this.getAttribute('data-section');
            if (section) {
                scrollToSection(section);
                e.preventDefault();
            } else {
                e.preventDefault(); // מונע גלילה לטפס
            }
        });
    });
    
    // טעינה ראשונית
    updateClientList();

    // ====================================================================
    // 10. הוספת פופ-אפ הסרת אחריות בכניסה (למתאמנים)
    // ====================================================================

    function showDisclaimerModal() {
        // יצירת המודאל
        const disclaimerModal = document.createElement('div');
        disclaimerModal.id = 'disclaimer-modal';
        disclaimerModal.className = 'modal-container';
        disclaimerModal.style.display = 'flex'; // מאלץ הצגה מיידית
        
        disclaimerModal.innerHTML = `
            <div class="modal-content disclaimer-modal-content">
                <div class="disclaimer-header">
                    <h2>⚠️ הצהרת בריאות ואחריות</h2>
                    <p class="subtitle">לפני השימוש במערכת</p>
                </div>
                
                <div class="disclaimer-body">
                    <div class="disclaimer-icon-section">
                        <div class="icon-box">
                            <span class="icon">👨‍⚕️</span>
                            <h3>לא תחליף לייעוץ מקצועי</h3>
                            <p>מערכת זו נועדה <strong>למטרת מידע בלבד</strong> ואינה מהווה תחליף לייעוץ רפואי, תזונתי או אימון מקצועי.</p>
                        </div>
                        
                        <div class="icon-box">
                            <span class="icon">💪</span>
                            <h3>התאמה אישית</h3>
                            <p>החישובים הם כלליים ויש להתאים אותם למצבך הבריאותי, הגיל, הניסיון והיכולות האישיות שלך.</p>
                        </div>
                        
                        <div class="icon-box">
                            <span class="icon">📋</span>
                            <h3>בדיקה רפואית</h3>
                            <p>מומלץ מאוד <strong>להתייעץ עם רופא</strong> לפני תחילת כל תוכנית אימון או שינוי תזונתי משמעותי.</p>
                        </div>
                    </div>
                    
                    <div class="warning-box">
                        <h4>🚨 חשוב לדעת:</h4>
                        <ul class="warning-list">
                            <li>אל תשתמש במערכת אם יש לך בעיות בריאותיות כלשהן ללא אישור רופא</li>
                            <li>הקשב לגופך - אם משהו כואב או מרגיש לא בסדר, הפסק מיד</li>
                            <li>העלייה במשקלים ובעצימות צריכה להיות הדרגתית ומבוקרת</li>
                            <li>שתייה מספקת ומנוחה הם חלק בלתי נפרד מההתקדמות</li>
                        </ul>
                    </div>
                    
                    <div class="agreement-section">
                        <div class="checkbox-container">
                            <input type="checkbox" id="age-confirm">
                            <label for="age-confirm">אני מעל גיל 18</label>
                        </div>
                        
                        <div class="checkbox-container">
                            <input type="checkbox" id="health-confirm">
                            <label for="health-confirm">אין לי בעיות בריאותיות ידועות / קיבלתי אישור רופא</label>
                        </div>
                        
                        <div class="checkbox-container">
                            <input type="checkbox" id="responsibility-confirm">
                            <label for="responsibility-confirm">אני מבין שהשימוש במערכת הוא על אחריותי המלאה</label>
                        </div>
                    </div>
                    
                    <div class="final-note">
                        <p><strong>בריאות גופך חשובה לנו! שימוש נכון ואחראי ישפר את התוצאות וימנע פציעות.</strong></p>
                    </div>
                </div>
                
                <div class="disclaimer-actions">
                    <button id="accept-disclaimer" class="primary-btn" disabled>
                        <span class="btn-icon">✅</span>
                        <span>אני מאשר ומסכים לתנאים</span>
                    </button>
                    <button id="decline-disclaimer" class="secondary-btn">
                        <span class="btn-icon">❌</span>
                        <span>לא מסכים - יציאה</span>
                    </button>
                </div>
                
                <div class="disclaimer-footer">
                    <p class="footer-text">מערכת זו פותחה על ידי GS-BM ונועדה לסייע בתהליך האימון והתזונה</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(disclaimerModal);
        
        // הגדרת אירועים לתיבות הסימון
        const checkboxes = disclaimerModal.querySelectorAll('input[type="checkbox"]');
        const acceptBtn = document.getElementById('accept-disclaimer');
        
        function updateAcceptButton() {
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            acceptBtn.disabled = !allChecked;
            acceptBtn.style.opacity = allChecked ? '1' : '0.6';
            acceptBtn.style.cursor = allChecked ? 'pointer' : 'not-allowed';
        }
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateAcceptButton);
        });
        
        // הגדרת אירועים לכפתורים
        document.getElementById('accept-disclaimer').addEventListener('click', function() {
            if (!this.disabled) {
                localStorage.setItem('disclaimerAccepted', 'true');
                localStorage.setItem('disclaimerAcceptedDate', new Date().toISOString());
                document.getElementById('disclaimer-modal').remove();
                
                // אפשר להוסיף כאן הודעה קטנה
                const welcomeMsg = document.createElement('div');
                welcomeMsg.className = 'welcome-message';
                welcomeMsg.innerHTML = `
                    <div class="welcome-content">
                        <span class="close-welcome">&times;</span>
                        <h3>🎉 ברוך הבא!</h3>
                        <p>כעת אתה יכול להתחיל להשתמש במערכת. זכור לשמור על בטיחות ולקבל הנחיות ממאמן אם אתה חדש באימונים.</p>
                        <button class="primary-btn small-btn" id="start-using">התחל להשתמש</button>
                    </div>
                `;
                document.body.appendChild(welcomeMsg);
                
                setTimeout(() => {
                    welcomeMsg.classList.add('show');
                }, 100);
                
                // סגירת הודעה
                welcomeMsg.querySelector('.close-welcome').addEventListener('click', () => {
                    welcomeMsg.remove();
                });
                
                document.getElementById('start-using').addEventListener('click', () => {
                    welcomeMsg.remove();
                });
                
                setTimeout(() => {
                    if (document.body.contains(welcomeMsg)) {
                        welcomeMsg.remove();
                    }
                }, 10000);
            }
        });
        
        document.getElementById('decline-disclaimer').addEventListener('click', function() {
            // יצירת מסך יציאה יפה
            document.body.innerHTML = '';
            document.body.style.cssText = `
                margin: 0;
                padding: 0;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                font-family: 'Rubik', sans-serif;
                text-align: center;
            `;
            
            const exitScreen = document.createElement('div');
            exitScreen.style.cssText = `
                padding: 40px;
                max-width: 600px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
            `;
            
            exitScreen.innerHTML = `
                <div style="margin-bottom: 30px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">👋</div>
                    <h1 style="color: #4CAF50; margin: 0 0 10px 0;">יציאה בטוחה</h1>
                    <p style="color: #ccc; font-size: 1.1em;">יצאת ממערכת החישובים והאימונים</p>
                </div>
                
                <div style="background: rgba(76, 175, 80, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 30px; border: 1px solid #4CAF50;">
                    <h3 style="color: #4CAF50; margin-top: 0;">🏥 זכור:</h3>
                    <p style="margin: 10px 0;">• התייעץ תמיד עם רופא לפני תחילת אימון</p>
                    <p style="margin: 10px 0;">• עבוד עם מאמן מקצועי אם אתה חדש</p>
                    <p style="margin: 10px 0;">• הקשב לגוף שלך בכל עת</p>
                </div>
                
                <div style="background: rgba(255, 193, 7, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 30px; border: 1px solid #FFC107;">
                    <h3 style="color: #FFC107; margin-top: 0;">💡 המלצות לשימוש בטוח:</h3>
                    <p style="margin: 10px 0;">• התחל לאט והעלה עומס בהדרגה</p>
                    <p style="margin: 10px 0;">• שמור על תזונה מאוזנת והידרציה</p>
                    <p style="margin: 10px 0;">• תן לגוף זמן להתאושש בין אימונים</p>
                </div>
                
                <p style="color: #888; font-size: 0.9em; margin-top: 30px;">
                    המערכת תסגר אוטומטית תוך <span id="countdown">10</span> שניות
                </p>
                
                <div style="margin-top: 20px;">
                    <button id="return-btn" style="
                        background: linear-gradient(135deg, #2196F3, #0D47A1);
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 1em;
                        cursor: pointer;
                        margin: 10px;
                        font-weight: bold;
                    ">חזרה למערכת</button>
                    
                    <button id="close-btn" style="
                        background: linear-gradient(135deg, #f44336, #c62828);
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 1em;
                        cursor: pointer;
                        margin: 10px;
                        font-weight: bold;
                    ">סגור חלון</button>
                </div>
            `;
            
            document.body.appendChild(exitScreen);
            
            // טיימר ספירה לאחור
            let countdown = 10;
            const countdownElement = document.getElementById('countdown');
            const countdownInterval = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    // מנסה לסגור את החלון
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.href = 'about:blank';
                    }
                }
            }, 1000);
            
            // כפתור חזרה
            document.getElementById('return-btn').addEventListener('click', function() {
                clearInterval(countdownInterval);
                location.reload();
            });
            
            // כפתור סגירה
            document.getElementById('close-btn').addEventListener('click', function() {
                clearInterval(countdownInterval);
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.close();
                }
            });
        });
        
        // מונע סגירה בלחיצה מחוץ
        disclaimerModal.addEventListener('click', function(e) {
            if (e.target === disclaimerModal) {
                // מרצד את המודאל
                this.querySelector('.disclaimer-modal-content').style.animation = 'none';
                setTimeout(() => {
                    this.querySelector('.disclaimer-modal-content').style.animation = 'disclaimerFadeIn 0.3s ease-out';
                }, 10);
                
                // מציג הודעה קטנה
                const existingAlert = document.querySelector('.quick-alert');
                if (!existingAlert) {
                    const alert = document.createElement('div');
                    alert.className = 'quick-alert';
                    alert.textContent = 'עליך לאשר את התנאים כדי להמשיך';
                    alert.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 50%;
                        transform: translateX(50%);
                        background: #f44336;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 8px;
                        z-index: 10000;
                        animation: fadeInOut 2s ease;
                    `;
                    document.body.appendChild(alert);
                    
                    setTimeout(() => {
                        if (document.body.contains(alert)) {
                            alert.remove();
                        }
                    }, 2000);
                }
            }
        });
    }

    // ====================================================================
    // 11. הוספת עיצוב CSS למודאל הסרת האחריות (למתאמנים)
    // ====================================================================

    function addDisclaimerCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* מודאל הסרת אחריות */
            .disclaimer-modal-content {
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 40px 30px;
            }
            
            .disclaimer-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #4CAF50;
            }
            
            .disclaimer-header h2 {
                color: #4CAF50;
                font-size: 2em;
                margin: 0 0 10px 0;
            }
            
            .subtitle {
                color: #777;
                font-size: 1.1em;
                margin: 0;
            }
            
            .disclaimer-icon-section {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .icon-box {
                background: rgba(33, 150, 243, 0.1);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 1px solid rgba(33, 150, 243, 0.3);
                transition: transform 0.3s;
            }
            
            .icon-box:hover {
                transform: translateY(-5px);
                background: rgba(33, 150, 243, 0.15);
            }
            
            .icon-box .icon {
                font-size: 40px;
                display: block;
                margin-bottom: 15px;
            }
            
            .icon-box h3 {
                color: #2196F3;
                margin: 0 0 10px 0;
                font-size: 1.2em;
            }
            
            .icon-box p {
                margin: 0;
                line-height: 1.5;
                color: #555;
            }
            
            .warning-box {
                background: rgba(255, 193, 7, 0.15);
                padding: 25px;
                border-radius: 12px;
                margin-bottom: 30px;
                border: 2px solid #FFC107;
            }
            
            .warning-box h4 {
                color: #FF9800;
                margin: 0 0 15px 0;
                font-size: 1.3em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .warning-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .warning-list li {
                padding: 10px 0 10px 30px;
                border-bottom: 1px dashed rgba(255, 193, 7, 0.3);
                position: relative;
                color: #795548;
            }
            
            .warning-list li:last-child {
                border-bottom: none;
            }
            
            .warning-list li:before {
                content: "⚠️";
                position: absolute;
                right: 0;
            }
            
            .agreement-section {
                background: rgba(156, 39, 176, 0.1);
                padding: 25px;
                border-radius: 12px;
                margin-bottom: 25px;
                border: 1px solid rgba(156, 39, 176, 0.3);
            }
            
            .checkbox-container {
                margin-bottom: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                transition: background 0.3s;
            }
            
            .checkbox-container:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .checkbox-container input[type="checkbox"] {
                width: 18px;
                height: 18px;
                margin-left: 10px;
                vertical-align: middle;
            }
            
            .checkbox-container label {
                cursor: pointer;
                font-weight: 500;
                color: #673AB7;
                vertical-align: middle;
            }
            
            .final-note {
                background: rgba(76, 175, 80, 0.1);
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                text-align: center;
                border: 1px solid #4CAF50;
            }
            
            .final-note p {
                color: #2E7D32;
                margin: 0;
                font-size: 1.1em;
            }
            
            .disclaimer-actions {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin: 30px 0;
            }
            
            #accept-disclaimer {
                background: linear-gradient(135deg, #4CAF50, #2E7D32);
                padding: 18px;
                font-size: 1.2em;
                border: none;
                border-radius: 10px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.3s;
                font-weight: bold;
            }
            
            #accept-disclaimer:disabled {
                background: linear-gradient(135deg, #9E9E9E, #757575);
                cursor: not-allowed;
                opacity: 0.6;
            }
            
            #accept-disclaimer:not(:disabled):hover {
                background: linear-gradient(135deg, #388E3C, #1B5E20);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
            }
            
            #decline-disclaimer {
                background: linear-gradient(135deg, #f44336, #c62828);
                padding: 18px;
                font-size: 1.2em;
                border: none;
                border-radius: 10px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.3s;
                font-weight: bold;
            }
            
            #decline-disclaimer:hover {
                background: linear-gradient(135deg, #d32f2f, #b71c1c);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(244, 67, 54, 0.4);
            }
            
            .btn-icon {
                font-size: 1.2em;
            }
            
            .disclaimer-footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #eee;
                margin-top: 20px;
            }
            
            .footer-text {
                color: #777;
                font-size: 0.9em;
                margin: 0;
            }
            
            /* הודעת ברכה */
            .welcome-message {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50, #2E7D32);
                color: white;
                padding: 20px;
                border-radius: 12px;
                max-width: 350px;
                z-index: 10000;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .welcome-message.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .welcome-content {
                position: relative;
            }
            
            .close-welcome {
                position: absolute;
                left: -10px;
                top: -10px;
                background: white;
                color: #4CAF50;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .welcome-content h3 {
                margin: 0 0 10px 0;
                font-size: 1.3em;
            }
            
            .welcome-content p {
                margin: 0 0 15px 0;
                line-height: 1.4;
            }
            
            /* אנימציות */
            @keyframes disclaimerFadeIn {
                from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateX(50%) translateY(-20px); }
                10%, 90% { opacity: 1; transform: translateX(50%) translateY(0); }
            }
            
            /* רספונסיביות */
            @media (max-width: 768px) {
                .disclaimer-modal-content {
                    padding: 20px 15px;
                    margin: 10px;
                }
                
                .disclaimer-icon-section {
                    grid-template-columns: 1fr;
                }
                
                .disclaimer-actions {
                    flex-direction: column;
                }
                
                .disclaimer-actions button {
                    width: 100%;
                }
                
                .welcome-message {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
            
            /* אנימציית רוטט */
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .shake {
                animation: shake 0.5s;
            }
        `;
        document.head.appendChild(style);
    }

    // ====================================================================
    // 12. אופטימיזציות למובייל
    // ====================================================================

    // הוספת עיצוב למובייל
    addDisclaimerCSS();

    // בדיקה אם כבר אישר בעבר
    if (!localStorage.getItem('disclaimerAccepted')) {
        // מחכה קצת לטעינת הדף
        setTimeout(() => {
            showDisclaimerModal();
        }, 800);
    } else {
        // אם כבר אישר, ממשיך רגיל
        updateClientList();
    }

    // ====================================================================
    // 13. התאמות מיוחדות למובייל
    // ====================================================================

    // מניעת זום אוטומטי במובייל (במיוחד באייפון)
    document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
        input.addEventListener('focus', function() {
            // גלילה קצת למעלה כדי שהמקלדת לא תסתיר את השדה
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });

    // שיפור חווית מגע במובייל
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        // הוספת מחלקה לגוף לציון שמדובר במובייל
        document.body.classList.add('mobile-device');
        
        // שיפור כפתורים במובייל
        document.querySelectorAll('.primary-btn, .secondary-btn, .action-btn, .nav-item').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.style.userSelect = 'none';
            btn.style.webkitTapHighlightColor = 'transparent';
            
            // הוספת אפקט לחיצה במובייל
            btn.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.97)';
                this.style.transition = 'transform 0.1s';
            });
            
            btn.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
            
            btn.addEventListener('touchcancel', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        // שיפור תפריט ניווט במובייל
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('touchstart', function(e) {
                // מניעת גלילה כשנוגעים בתפריט
                e.stopPropagation();
            });
        });
    }

    // התאמת טבלאות למובייל
    function optimizeTablesForMobile() {
        if (window.innerWidth <= 768) {
            // התאמת גודל פונט לטבלאות
            const tables = document.querySelectorAll('.results-table, .macro-table, .history-table');
            tables.forEach(table => {
                if (window.innerWidth <= 480) {
                    table.style.fontSize = '0.8em';
                } else {
                    table.style.fontSize = '0.9em';
                }
            });
            
            // וידוא שהטבלאות מסתובבות אופקית במובייל
            const tableContainers = document.querySelectorAll('.card');
            tableContainers.forEach(container => {
                const tablesInContainer = container.querySelectorAll('table');
                if (tablesInContainer.length > 0) {
                    // בדיקה אם כבר יש עטיפה
                    if (!container.querySelector('.table-wrapper')) {
                        tablesInContainer.forEach(table => {
                            const wrapper = document.createElement('div');
                            wrapper.className = 'table-wrapper';
                            wrapper.style.overflowX = 'auto';
                            wrapper.style.margin = '10px 0';
                            table.parentNode.insertBefore(wrapper, table);
                            wrapper.appendChild(table);
                        });
                    }
                }
            });
        }
    }

    // קריאה ראשונית לאופטימיזציה
    optimizeTablesForMobile();
    
    // עדכון בגודל החלון
    window.addEventListener('resize', optimizeTablesForMobile);

    // עדכון היסטוריה בעת שינוי גודל
    window.addEventListener('resize', function() {
        if (!historySection.classList.contains('hidden')) {
            displayClientHistory();
        }
    });

    // מניעת שליחה בטעות של טופס במקלדת במובייל
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && window.innerWidth <= 768) {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT')) {
                e.preventDefault();
                // במקום שליחה, עובר לשדה הבא
                const formElements = form.querySelectorAll('input, select, textarea');
                const currentIndex = Array.from(formElements).indexOf(activeElement);
                if (currentIndex < formElements.length - 1) {
                    formElements[currentIndex + 1].focus();
                }
            }
        }
    });

    // סיום פונקציית window.onload
};