window.onload = function() {
    // השתמש ב-calculateBtn כדי להקשיב ללחיצה
    const form = document.getElementById('calorie-form');
    const calculateBtn = document.getElementById('calculate-btn'); 
    const resetBtn = document.getElementById('reset-btn');
    const resultsDiv = document.getElementById('results');
    const errorMessage = document.getElementById('error-message');
    const warningMessageDiv = document.getElementById('warning-message');
    const warningText = document.getElementById('warning-text');
    
    // פונקציות עזר לחישובים (נותרו ללא שינוי)

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
    
    function getMacroNutrients(tdee, weight, macroMethod) {
        let proteinGrams, fatGrams, carbGrams;
        let proteinCals, fatCals, carbCals;
        let totalCalsFromMacro;
        
        if (macroMethod === 'grams_per_kg') {
            proteinGrams = 2.0 * weight; 
            proteinCals = proteinGrams * 4;
            fatGrams = 0.8 * weight;
            fatCals = fatGrams * 9;
            
            carbCals = tdee - proteinCals - fatCals;
            if (carbCals < 0) {
                carbCals = 0;
            }
            carbGrams = carbCals / 4;

            totalCalsFromMacro = proteinCals + fatCals + carbCals;

        } else {
            const proteinPercent = 0.35; 
            const fatPercent = 0.25;     
            const carbPercent = 0.40;    
            
            proteinCals = tdee * proteinPercent;
            fatCals = tdee * fatPercent;
            carbCals = tdee * carbPercent;
            
            proteinGrams = proteinCals / 4;
            fatGrams = fatCals / 9;
            carbGrams = carbCals / 4;

            totalCalsFromMacro = tdee;
        }

        return {
            proteinGrams: proteinGrams,
            fatGrams: fatGrams,
            carbGrams: carbGrams,
            
            proteinPercent: (proteinCals / totalCalsFromMacro) * 100,
            fatPercent: (fatCals / totalCalsFromMacro) * 100,
            carbPercent: (carbCals / totalCalsFromMacro) * 100
        };
    }
    
    function updateMacroResults(prefix, calories, weight, macroMethod) {
        const macro = getMacroNutrients(calories, weight, macroMethod);

        document.getElementById(`${prefix}-result`).textContent = Math.round(calories).toLocaleString();

        document.getElementById(`${prefix}_p_g`).textContent = Math.round(macro.proteinGrams).toLocaleString();
        document.getElementById(`${prefix}_f_g`).textContent = Math.round(macro.fatGrams).toLocaleString();
        document.getElementById(`${prefix}_c_g`).textContent = Math.round(macro.carbGrams).toLocaleString();

        document.getElementById(`${prefix}_p_p`).textContent = `${Math.round(macro.proteinPercent)}%`;
        document.getElementById(`${prefix}_f_p`).textContent = `${Math.round(macro.fatPercent)}%`;
        document.getElementById(`${prefix}_c_p`).textContent = `${Math.round(macro.carbPercent)}%`;
    }

    // *** פונקציה ראשית: חישוב והצגת תוצאות ***
    
    function calculateAndDisplayResults(e) {
        if (e && e.preventDefault) { 
            e.preventDefault();
        }

        errorMessage.classList.add('hidden');
        warningMessageDiv.classList.add('hidden');
        
        // --- קבלת נתונים (שימו לב לקריאה דרך .value) ---
        const gender = document.getElementById('gender').value;
        const age = parseInt(document.getElementById('age').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const activityLevel = document.getElementById('activity').value;
        const goal = document.getElementById('goal').value;
        // חשוב לבדוק אם הקלט ריק או לא מספר תקף
        const bfPercentVal = document.getElementById('body-fat-percent').value;
        const bfPercent = bfPercentVal === "" ? NaN : parseFloat(bfPercentVal);
        const macroMethod = document.getElementById('macro-method').value;

        // אימות קלט בסיסי
        if (!gender || isNaN(age) || isNaN(weight) || isNaN(height) || !activityLevel || !goal) {
            errorMessage.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
            resetBtn.classList.add('hidden');
            return;
        }
        if (age <= 0 || weight <= 0 || height <= 0) {
            errorMessage.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
            resetBtn.classList.add('hidden');
            return;
        }
        
        // חישוב TDEE
        let bmr;
        if (!isNaN(bfPercent) && bfPercent > 0) {
            bmr = calculateKatchBMR(weight, bfPercent);
        } else {
            bmr = calculateMifflinBMR(gender, weight, height, age);
        }
        const tdee = bmr * activityMultipliers[activityLevel];
        
        // חישוב יעדים קלוריים
        const weeklyCalorieDeficit = 7700;
        let calAdjustment;

        switch (goal) {
            case 'maintain': calAdjustment = 0; break;
            case 'mild_cut': calAdjustment = -(weeklyCalorieDeficit * 0.25) / 7; break;
            case 'moderate_cut': calAdjustment = -(weeklyCalorieDeficit * 0.5) / 7; break;
            case 'mild_bulk': calAdjustment = (weeklyCalorieDeficit * 0.25) / 7; break;
            case 'moderate_bulk': calAdjustment = (weeklyCalorieDeficit * 0.5) / 7; break;
            default: calAdjustment = 0;
        }

        let targetCalories = tdee + calAdjustment;
        
        const bmi = calculateBMI(weight, height);

        // בדיקת אזהרת קלוריות
        const minCaloriesMale = 1500;
        const minCaloriesFemale = 1200;
        let minCalorieLimit = gender === 'male' ? minCaloriesMale : minCaloriesFemale;

        if (targetCalories < minCalorieLimit) {
            warningText.textContent = `צריכת הקלוריות היומית המחושבת (${Math.round(targetCalories).toLocaleString()} קלוריות) נמוכה מהסף המינימלי המומלץ (${minCalorieLimit} קלוריות). אנא התייעץ עם איש מקצוע.`;
            warningMessageDiv.classList.remove('hidden');
            document.getElementById('target-calories').textContent = minCalorieLimit;
            targetCalories = minCalorieLimit; 
        } else {
            document.getElementById('target-calories').textContent = Math.round(targetCalories).toLocaleString();
        }

        // הצגת כל התוצאות
        document.getElementById('tdee-result').textContent = `סה"כ ${Math.round(tdee).toLocaleString()} קלוריות ביום`;
        document.getElementById('bmi-result').textContent = `${bmi.toFixed(1)}`;
        
        // עדכון פירוט מאקרו מלא
        updateMacroResults('m', tdee, weight, macroMethod);
        const moderateCut = tdee - (weeklyCalorieDeficit * 0.5) / 7;
        updateMacroResults('c', moderateCut, weight, macroMethod);
        const moderateBulk = tdee + (weeklyCalorieDeficit * 0.5) / 7;
        updateMacroResults('b', moderateBulk, weight, macroMethod);
        
        // הצגת הדיב
        resultsDiv.classList.remove('hidden');
        resultsDiv.style.opacity = '1';
        resultsDiv.style.transform = 'translateY(0)';
        resetBtn.classList.remove('hidden');
    }

    // *** פונקציית איפוס נתונים ***
    
    function resetCalculator() {
        document.getElementById('calorie-form').reset();

        document.getElementById('results').classList.add('hidden');
        document.getElementById('results').style.opacity = '0';
        document.getElementById('results').style.transform = 'translateY(20px)';
        document.getElementById('reset-btn').classList.add('hidden');
        
        document.getElementById('error-message').classList.add('hidden');
        document.getElementById('warning-message').classList.add('hidden');

        document.getElementById('target-calories').textContent = '--';
        document.getElementById('tdee-result').textContent = '--';
        document.getElementById('bmi-result').textContent = '--';

        const prefixes = ['m', 'c', 'b'];
        prefixes.forEach(prefix => {
            document.getElementById(`${prefix}-result`).textContent = '--';
            document.getElementById(`${prefix}_p_g`).textContent = '--';
            document.getElementById(`${prefix}_f_g`).textContent = '--';
            document.getElementById(`${prefix}_c_g`).textContent = '--';
            document.getElementById(`${prefix}_p_p`).textContent = '--';
            document.getElementById(`${prefix}_f_p`).textContent = '--';
            document.getElementById(`${prefix}_c_p`).textContent = '--';
        });
    }

    // אירועי טופס וכפתורים
    calculateBtn.addEventListener('click', calculateAndDisplayResults);
    resetBtn.addEventListener('click', resetCalculator);
    
    // לוגיקת המודאל
    const modalContainer = document.getElementById('modal-container');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.querySelector('.close-btn');

    openModalBtn.onclick = function(e) {
        e.preventDefault();
        modalContainer.classList.remove('hidden');
    }

    closeBtn.onclick = function() {
        modalContainer.classList.add('hidden');
    }

    window.onclick = function(event) {
        if (event.target === modalContainer) {
            modalContainer.classList.add('hidden');
        }
    }
}; // סגירת window.onload