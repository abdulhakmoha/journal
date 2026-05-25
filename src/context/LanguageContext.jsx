import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const dictionary = {
  en: {
    dashboard: "Dashboard",
    newTrade: "New Trade",
    tradeJournal: "Trade Journal",
    weeklyReview: "Weekly Review",
    analytics: "Analytics",
    mindsetJournal: "Mindset Journal",
    backtesting: "Backtesting",
    riskCalculator: "Risk Calculator",
    economicCalendar: "Economic Calendar",
    settings: "Settings",
    pricingPlans: "Pricing & Plans",
    adminPayments: "Admin: Payments",
    signOut: "Sign Out",
    disciplineScore: "Discipline Score",
    freeTrades: "Free Trades",
    welcome: "Welcome",
    server: "Server",
    online: "Online",
    tradingDate: "Trading Date",
    tradingTime: "Trading Time",
    account: "Account",
    type: "Type",
    unit: "Unit",
    risk: "Risk",
    reward: "Reward",
    status: "Status",
    mistake: "Mistake?",
    rulesChecklist: "Trade Rules (Checklist)",
    beforeChart: "Before Chart",
    afterChart: "After Chart",
    preThoughts: "Pre-Trade Thoughts",
    postThoughts: "Post-Trade Reflection",
    resetForm: "Reset Form",
    saveDraft: "Save Draft",
    completeExecution: "Complete Trade Execution",
    updateRecord: "Update Trade Record",
    winRate: "Win Rate",
    netProfit: "Net Profit",
    profitRatio: "Profit Ratio",
    totalTrades: "Total Trades",
    mistakes: "Mistakes",
    preMood: "Mood Before Entry",
    postMood: "Mood After Exit",
    newsConflict: "News Conflict Alert",
    newsConflictDesc: "Traded within 30m of High-Impact news",
    coachReview: "Algorithmic Trading Coach",
    moodPerformanceTitle: "Mood vs. Performance Correlation",
    bestDays: "Best Trading Days",
    edgeTitle: "Grade Performance — Where is your Real Edge?",
    confident: "Confident",
    fearful: "Fearful",
    aggressive: "Aggressive",
    calm: "Calm",
    neutral: "Neutral",
    win: "Win",
    loss: "Loss",
    be: "Break-even",
    active: "Active",
    back: "Back",
    confirmDelete: "Are you sure you want to delete this?",
    confirmLogout: "Are you sure you want to sign out?",
    saveSuccess: "Saved successfully!",
    errorSaving: "Error saving data",
    saveReflection: "Save Reflection",
    psychologyHistory: "Psychology History",
    moodDistribution: "Mood Distribution",
    mindsetMirror: "Mindset Mirror",
    mindsetDesc: "Analyze your psychology. Your mental state is 80% of your trading success."
  },
  so: {
    dashboard: "Dashboard-ka",
    newTrade: "Trade Cusub",
    tradeJournal: "Buugga Trades-ka",
    weeklyReview: "Falanqaynta Toddobaadka",
    analytics: "Analytics-ka",
    mindsetJournal: "Niyadda & Dareenka",
    backtesting: "Backtesting-ka",
    riskCalculator: "Xisaabiyaha Halista",
    economicCalendar: "Wararka Dhaqaalaha",
    settings: "Habeynta System-ka",
    pricingPlans: "Qiimaha & Qorshayaasha",
    adminPayments: "Admin: Bixinta Lacagta",
    signOut: "Ka Bax System-ka",
    disciplineScore: "Heerka Anshaxa",
    freeTrades: "Trades Bilaash Ah",
    welcome: "Ku soo dhawaada",
    server: "Server-ka",
    online: "Online",
    tradingDate: "Taariikhda Trade-ka",
    tradingTime: "Saacadda Trade-ka",
    account: "Account-ka",
    type: "Nooca",
    unit: "Cabirka",
    risk: "Halista (Risk)",
    reward: "Faa'iidada (Reward)",
    status: "Xaaladda",
    mistake: "Miyuu ahaa Khalad?",
    rulesChecklist: "Shuruucda Trade-ka (Checklist)",
    beforeChart: "Sawirka Ka Hor (Before)",
    afterChart: "Sawirka Ka Dib (After)",
    preThoughts: "Dareenkaaga Ka Hor Trade-ka",
    postThoughts: "Falanqaynta Ka Dib Trade-ka",
    resetForm: "Nadiifi Foomka",
    saveDraft: "Badbaadi Qabyo (Draft)",
    completeExecution: "Dhammaystir Fulinta Trade-ka",
    updateRecord: "Cusboonaysii Xogta Trade-ka",
    winRate: "Boqolleyda Guusha",
    netProfit: "Net Profit (Faa'iidada)",
    profitRatio: "Saamiga Faa'iidada",
    totalTrades: "Warta Trades-ka",
    mistakes: "Khaladaadka",
    preMood: "Niyaddaada Ka Hor Trade-ka",
    postMood: "Niyaddaada Ka Dib Trade-ka",
    newsConflict: "Digniin: Warar Dhaqaale",
    newsConflictDesc: "Waxaad ganacsatay xilli uu jiray war dhaqaale oo saameyn sare leh (High-Impact news)!",
    coachReview: "Tababaraha SomCoach (AI)",
    moodPerformanceTitle: "Saamaynta Dareenkaaga ee Natiijooyinka (Mood vs. P&L)",
    bestDays: "Maalmaha ugu Ganacsiga Fiican",
    edgeTitle: "Darajada Trade-ka iyo halka Edge-kaagu ku jiro",
    confident: "Kalsooni",
    fearful: "Cabsi",
    aggressive: "Cadho/Degdeg",
    calm: "Dajis/Deggen",
    neutral: "Dhexdhexaad",
    win: "Guul",
    loss: "Khasaare",
    be: "Break-even",
    active: "Active",
    back: "Dib u Laabo",
    confirmDelete: "Ma hubtaa inaad tirtirto tan?",
    confirmLogout: "Ma hubtaa inaad ka baxdo system-ka?",
    saveSuccess: "Si guul leh ayaa loo badbaadiyay!",
    errorSaving: "Cillad ayaa dhacday inta lagu guda jiray badbaadinta",
    saveReflection: "Kaydi Dareenka",
    psychologyHistory: "Taariikhda Psychology-ga",
    moodDistribution: "Qaybaha Niyaddaada",
    mindsetMirror: "Muraayadda Niyadda",
    mindsetDesc: "Falanqee maskaxdaada iyo dareenkaaga. Niyaddaadu waa 80% guushaada trading-ka."
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('somtrader_lang');
    return saved === 'so' ? 'so' : 'en';
  });

  const setLanguage = (lang) => {
    const newLang = lang === 'so' ? 'so' : 'en';
    setLanguageState(newLang);
    localStorage.setItem('somtrader_lang', newLang);
  };

  const t = (key) => {
    if (!dictionary[language]) return key;
    return dictionary[language][key] || dictionary['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
