import React, { useState, useMemo } from 'react';
import { AlertTriangle, Award, Calendar, Brain, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// ─────────────────────────────────────────────
// SOMCOACH: Algorithmic coaching engine
// ─────────────────────────────────────────────
const generateSomCoachReport = (filteredTrades, language) => {
  const sections = [];
  const isSo = language === 'so';

  if (filteredTrades.length === 0) {
    return [{
      icon: '📭',
      title: isSo ? 'Xogta Ma Jirto' : 'No Data Available',
      type: 'neutral',
      body: isSo
        ? 'Wali trades ma jiraan xiligan la xushay. Bilaaw ganacsiga oo xogtaada kaydi si aad u hesho falanqayn kooban.'
        : 'No trades found in the selected period. Start logging trades to receive personalized algorithmic coaching.'
    }];
  }

  const wins = filteredTrades.filter(t => t.status === 'Win');
  const losses = filteredTrades.filter(t => t.status === 'Loss');
  const mistakes = filteredTrades.filter(t => t.isMistake);
  const newsConflicts = filteredTrades.filter(t => t.newsConflict);
  const winRate = Math.round((wins.length / filteredTrades.length) * 100);
  const mistakeRate = Math.round((mistakes.length / filteredTrades.length) * 100);
  const newsConflictWins = newsConflicts.filter(t => t.status === 'Win');
  const newsConflictRate = newsConflicts.length === 0 ? 0 : Math.round((newsConflictWins.length / newsConflicts.length) * 100);

  // Mood stats
  const moodNames = ['Confident', 'Calm', 'Neutral', 'Fearful', 'Aggressive'];
  const moodStats = moodNames.map(mood => {
    const mTrades = filteredTrades.filter(t => t.preMood === mood);
    const mWins = mTrades.filter(t => t.status === 'Win').length;
    const mWR = mTrades.length === 0 ? null : Math.round((mWins / mTrades.length) * 100);
    return { mood, count: mTrades.length, winRate: mWR };
  }).filter(m => m.count > 0).sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0));

  const bestMood = moodStats[0];
  const worstMood = [...moodStats].sort((a, b) => (a.winRate ?? 100) - (b.winRate ?? 100))[0];

  // Rules analysis
  const rulesMap = {};
  filteredTrades.forEach(tr => {
    if (tr.rules && typeof tr.rules === 'object') {
      Object.entries(tr.rules).forEach(([rule, checked]) => {
        if (!rulesMap[rule]) rulesMap[rule] = { checked: 0, total: 0 };
        rulesMap[rule].total++;
        if (checked) rulesMap[rule].checked++;
      });
    }
  });
  const worstRule = Object.entries(rulesMap)
    .map(([rule, v]) => ({ rule, adherence: Math.round((v.checked / v.total) * 100) }))
    .sort((a, b) => a.adherence - b.adherence)[0];

  // Day analysis
  const dayMap = {};
  filteredTrades.forEach(tr => {
    const d = new Date(tr.timestamp).getDay();
    if (!dayMap[d]) dayMap[d] = { wins: 0, total: 0 };
    dayMap[d].total++;
    if (tr.status === 'Win') dayMap[d].wins++;
  });
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesSo = ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimce', 'Sabti'];
  const dayEntries = Object.entries(dayMap).map(([d, v]) => ({
    day: isSo ? dayNamesSo[d] : dayNamesEn[d],
    winRate: Math.round((v.wins / v.total) * 100),
    count: v.total
  }));
  const bestDay = [...dayEntries].sort((a, b) => b.winRate - a.winRate)[0];
  const worstDay = [...dayEntries].sort((a, b) => a.winRate - b.winRate)[0];

  // SECTION 1: Win Rate
  if (winRate >= 60) {
    sections.push({
      icon: '🏆', type: 'success',
      title: isSo ? 'Natiijooyinka: Heerka Sare' : 'Performance: Elite Level',
      body: isSo
        ? `Boqolleyda guushaadu waxay tahay ${winRate}%. Tani waa natiijo aad u fiican. Waxaad ka mid tahay ganacsatada ugu wanaagsan. Sii wad habkaagii — xiligan ayaa ugu muhiimsan in aad gacan saar saarto nidaamka.`
        : `Your win rate is ${winRate}%, placing you in an elite category. Your system is working. Stay systematic and trust your edge — do not change what is working.`
    });
  } else if (winRate >= 50) {
    sections.push({
      icon: '📈', type: 'primary',
      title: isSo ? 'Natiijooyinka: Wanaagsan — Hormar Sii Jira' : 'Performance: Solid & Improving',
      body: isSo
        ? `Boqolleyda guushaadu waxay tahay ${winRate}%. Waa natiijo fiican laakiin waxaa jira meel horumarintu ku yimaadaan. Intaad ku fekerto in aad trade-ka badan samayso, ka shaqee shuruucda galitaanka.`
        : `Your win rate is ${winRate}%. You are profitable but there is room to grow. Focus on setup quality over volume — only take high-conviction entries.`
    });
  } else {
    sections.push({
      icon: '⚠️', type: 'danger',
      title: isSo ? 'Digniin: Boqolleyda Guusha Waa Hoose' : 'Warning: Low Win Rate Detected',
      body: isSo
        ? `Boqolleyda guushaadu waxay tahay ${winRate}% — ${losses.length} khasaare. Jooji trading-ka 2 maalmood, dib u akhriso qorshahaaga. Setup-yada Grade-A kaliya ayaa xaq u leh inaad gashid.`
        : `Win rate is only ${winRate}%, with ${losses.length} losses. Pause trading for 2 days, review your trade plan, and only execute Grade A setups going forward.`
    });
  }

  // SECTION 2: Discipline
  if (mistakeRate > 20) {
    sections.push({
      icon: '🚨', type: 'danger',
      title: isSo ? 'Anshaxa: Khaladaad Badan' : 'Discipline: High Mistake Rate',
      body: isSo
        ? `${mistakes.length} khalad ayaad sameysay (${mistakeRate}%).${worstRule ? ` Sharciga ugu badan ee la jabay: "${worstRule.rule}" (${100 - worstRule.adherence}% wakhtiyadii).` : ''} Isticmaal checklist-ka trade-ka si taxadar ah.`
        : `${mistakes.length} mistakes logged (${mistakeRate}%).${worstRule ? ` Most violated rule: "${worstRule.rule}" (broken ${100 - worstRule.adherence}% of the time).` : ''} Rigorously follow your pre-trade checklist.`
    });
  } else if (mistakeRate > 0) {
    sections.push({
      icon: '🔍', type: 'warning',
      title: isSo ? 'Anshaxa: Xoogaa Khaladaad Ah' : 'Discipline: Minor Leaks Detected',
      body: isSo
        ? `${mistakes.length} khalad (${mistakeRate}%).${worstRule ? ` Ka taxadar sharciga: "${worstRule.rule}".` : ''} Maalmaha aad khalad galeyso xidh shaxanka.`
        : `${mistakes.length} mistakes (${mistakeRate}%).${worstRule ? ` Watch rule: "${worstRule.rule}".` : ''} Step away on days you notice rule-breaking.`
    });
  } else {
    sections.push({
      icon: '🧘', type: 'success',
      title: isSo ? 'Anshaxa: Xeeladayn Buuxda' : 'Discipline: Perfect Execution',
      body: isSo
        ? '0 khalad — xeeladayntaadu waa buuxda! Tani waa sifada ugu muhiimsan ganacsatada guuleysta. Sii wad habkaagan.'
        : 'Zero mistakes — flawless discipline. This is the most important trait of profitable traders. Keep it up.'
    });
  }

  // SECTION 3: Mood Psychology
  if (bestMood && worstMood && bestMood.mood !== worstMood.mood) {
    const moodSoMap = { Confident: 'Kalsooni', Calm: 'Dajis', Neutral: 'Dhexdhexaad', Fearful: 'Cabsi', Aggressive: 'Cadho/Degdeg' };
    const bestName = isSo ? (moodSoMap[bestMood.mood] || bestMood.mood) : bestMood.mood;
    const worstName = isSo ? (moodSoMap[worstMood.mood] || worstMood.mood) : worstMood.mood;
    sections.push({
      icon: '🧠', type: 'primary',
      title: isSo ? 'Cilmi-Nafsiga: Niyaddaada iyo Guushada' : 'Psychology: Mood vs. Win Rate',
      body: isSo
        ? `Aad baad ugu guuleysan tahay marka niyaddaadu tahay "${bestName}" (${bestMood.winRate}% guul, ${bestMood.count} trades). Marka niyaddaadu tahay "${worstName}" nalda guushaadu way hoos u dhacday ${worstMood.winRate}%. Talada SomCoach: ${worstMood.mood === 'Fearful' ? 'Marka aad cabsi qabto ha gelin trade.' : worstMood.mood === 'Aggressive' ? 'Marka aad cadheysan tahay xidh shaxanka.' : `Ganacsiga kaliya ka soo gal marka niyaddaadu tahay "${bestName}".`}`
        : `You perform best when "${bestName}" (${bestMood.winRate}% win rate, ${bestMood.count} trades). When feeling "${worstName}", your win rate drops to ${worstMood.winRate}%. ${worstMood.mood === 'Fearful' ? 'Never trade when fearful — wait for clarity.' : worstMood.mood === 'Aggressive' ? 'When feeling aggressive or impulsive, close your charts.' : `Only trade when feeling ${bestMood.mood.toLowerCase()}.`}`
    });
  } else if (bestMood) {
    sections.push({
      icon: '🧠', type: 'primary',
      title: isSo ? 'Cilmi-Nafsiga: Niyaddaada' : 'Psychology: Mood Profile',
      body: isSo
        ? `Niyaddaada ugu badan ee trade-ka waxay ahayd "${bestMood.mood}" (${bestMood.count} trades). Sii wad diiwaangelinta niyaddaada.`
        : `Your most common pre-trade mood is "${bestMood.mood}" (${bestMood.count} trades). Keep tracking mood consistently for deeper insights.`
    });
  }

  // SECTION 4: News Conflicts
  if (newsConflicts.length > 0) {
    sections.push({
      icon: '📰', type: newsConflictRate < 40 ? 'danger' : 'warning',
      title: isSo ? 'Wararka Dhaqaale: Saameynta' : 'News Events: Impact Analysis',
      body: isSo
        ? `${newsConflicts.length} trade ayaad samaysay xilli wararka weyn (${newsConflictRate}% guul). ${newsConflictRate < 40 ? 'Xogtu waxay muujinaysaa inaad khasaaro geysan tahay marka aad news-ka ganacsato. Ka fogow 30 daqiiqo kahor/ka dib news weyn.' : 'Waxaad u muujinaysaa xoogaa adkeysi. Ka taxadar spread-ka iyo slippage-ka.'}`
        : `You traded ${newsConflicts.length} times during high-impact news (${newsConflictRate}% win rate). ${newsConflictRate < 40 ? 'Data shows news-time trading hurts your performance. Avoid all trades 30 min before/after major events.' : 'You handle news volatility reasonably, but stay cautious of spread widening.'}`
    });
  } else if (filteredTrades.length >= 3) {
    sections.push({
      icon: '✅', type: 'success',
      title: isSo ? 'Wararka Dhaqaale: Waa Nadiif' : 'News Events: Clean Record',
      body: isSo
        ? 'Waa natiijo fiican — wax trade ah kuma jiraan xilli wararka weyn. Tani waxay muujinaysaa xeeladayn risk fiican.'
        : 'Excellent — no trades during high-impact news events. This demonstrates strong risk discipline and timing awareness.'
    });
  }

  // SECTION 5: Best / Worst Day
  if (bestDay && worstDay && bestDay.day !== worstDay.day) {
    sections.push({
      icon: '📅', type: 'neutral',
      title: isSo ? 'Maalmaha Fiican iyo Xun' : 'Trading Days: Best & Worst',
      body: isSo
        ? `Maalintaada ugu fiican: ${bestDay.day} (${bestDay.winRate}% guul, ${bestDay.count} trades). Maalintaada ugu xun: ${worstDay.day} (${worstDay.winRate}% guul). Hoos u dhig tirada trade-ka ${worstDay.day} kana shaqee si dheeraad ah ${bestDay.day}.`
        : `Best day: ${bestDay.day} (${bestDay.winRate}% win rate, ${bestDay.count} trades). Worst day: ${worstDay.day} (${worstDay.winRate}% win rate). Reduce or eliminate positions on ${worstDay.day} and maximise focus on ${bestDay.day}.`
    });
  }

  // SECTION 6: Overall Score
  const overallScore = Math.min(100, Math.round(
    (winRate * 0.4) +
    ((100 - mistakeRate) * 0.2) +
    (newsConflicts.length === 0 ? 20 : Math.min(newsConflictRate, 100) * 0.2) +
    (bestMood ? Math.min(bestMood.winRate ?? 50, 100) * 0.2 : 20)
  ));
  const levelEn = overallScore >= 80 ? 'Elite Trader' : overallScore >= 65 ? 'Advanced Trader' : overallScore >= 50 ? 'Developing Trader' : 'Needs Improvement';
  const levelSo = overallScore >= 80 ? 'Ganacsi Heer-Sare' : overallScore >= 65 ? 'Ganacsi Horumarsan' : overallScore >= 50 ? 'Sii Kordhaya' : 'Horumar Looga Baahan Yahay';

  sections.push({
    icon: '🎯',
    type: overallScore >= 70 ? 'success' : overallScore >= 50 ? 'primary' : 'danger',
    title: isSo ? `SomCoach Dhibcaha: ${overallScore}/100 — ${levelSo}` : `SomCoach Score: ${overallScore}/100 — ${levelEn}`,
    body: isSo
      ? `Xasaabinta: boqolleyda guusha (40%) + anshaxa (20%) + wararka (20%) + niyaddaada (20%) = ${overallScore}/100. ${overallScore >= 70 ? 'Aad baad u wanaagsantahay — sii wad.' : overallScore >= 50 ? 'Waxaa jira horumar la arki karo — xoojiyo anshaxa.' : 'Ku noqo trading plan-kaaga oo ka shaqee setup-yada ugu wanaagsan.'}`
      : `Score breakdown: win rate (40%) + discipline (20%) + news awareness (20%) + mood management (20%) = ${overallScore}/100. ${overallScore >= 70 ? 'Outstanding — maintain your systems.' : overallScore >= 50 ? 'Good foundation with clear improvement areas.' : 'Focus on fundamentals and execute only your best setups.'}`
  });

  return sections;
};

// ─────────────────────────────────────────────
// MOOD vs PERFORMANCE CHART
// ─────────────────────────────────────────────
const MoodChart = ({ trades, t }) => {
  const MOODS = ['Confident', 'Calm', 'Neutral', 'Fearful', 'Aggressive'];
  const COLORS = { Confident: '#38bdf8', Calm: '#10b981', Neutral: '#a78bfa', Fearful: '#f59e0b', Aggressive: '#ef4444' };

  const data = MOODS.map(mood => {
    const mTrades = trades.filter(tr => tr.preMood === mood);
    const mWins = mTrades.filter(tr => tr.status === 'Win').length;
    const mLosses = mTrades.filter(tr => tr.status === 'Loss').length;
    const wr = mTrades.length === 0 ? 0 : Math.round((mWins / mTrades.length) * 100);
    const netR = mTrades.reduce((acc, tr) => {
      if (tr.status === 'Win') return acc + (parseFloat(tr.reward) || 1);
      if (tr.status === 'Loss') return acc - (parseFloat(tr.risk) || 1);
      return acc;
    }, 0);
    return { mood, wr, count: mTrades.length, wins: mWins, losses: mLosses, netR: parseFloat(netR.toFixed(2)) };
  }).filter(m => m.count > 0);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        {t('preMood')} — {t('totalTrades')}: 0
      </div>
    );
  }

  const maxWR = Math.max(...data.map(m => m.wr), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {data.map((m, i) => (
        <motion.div key={m.mood} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: COLORS[m.mood] }}>
              {t(m.mood.toLowerCase())}
              <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.73rem', marginLeft: '6px' }}>({m.count} trades)</span>
            </span>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--success)' }}>✅ {m.wins}</span>
              <span style={{ color: 'var(--danger)' }}>❌ {m.losses}</span>
              <span style={{ color: m.netR >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{m.netR >= 0 ? '+' : ''}{m.netR}%</span>
              <span style={{ color: m.wr >= 55 ? 'var(--success)' : m.wr >= 40 ? 'var(--warning)' : 'var(--danger)', fontWeight: 'bold', minWidth: '46px', textAlign: 'right' }}>{m.wr}% WR</span>
            </div>
          </div>
          <div style={{ height: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(m.wr / maxWR) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              style={{ height: '100%', borderRadius: '10px', background: `linear-gradient(90deg, ${COLORS[m.mood]}, ${COLORS[m.mood]}66)` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const Review = ({ trades, accounts }) => {
  const { t, language } = useLanguage();
  const [timeframe, setTimeframe] = useState('This Week');
  const [selectedAccount, setSelectedAccount] = useState('All Accounts');
  const [customMonth, setCustomMonth] = useState(new Date().toISOString().slice(0, 7));

  const filteredTrades = useMemo(() => {
    let filtered = [...trades];
    if (selectedAccount !== 'All Accounts') filtered = filtered.filter(tr => tr.account === selectedAccount);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (timeframe === 'Custom Month') {
      const [year, month] = customMonth.split('-').map(Number);
      return filtered.filter(tr => { const d = new Date(tr.timestamp); return d.getFullYear() === year && (d.getMonth() + 1) === month; });
    }
    switch (timeframe) {
      case 'This Week': {
        const s = new Date(startOfToday); s.setDate(s.getDate() - s.getDay());
        return filtered.filter(tr => new Date(tr.timestamp) >= s);
      }
      case 'This Month':
        return filtered.filter(tr => new Date(tr.timestamp) >= new Date(now.getFullYear(), now.getMonth(), 1));
      case 'All Time':
        return filtered;
      default:
        if (timeframe.startsWith('Last ') && timeframe.endsWith(' Months')) {
          const months = parseInt(timeframe.split(' ')[1]);
          if (!isNaN(months)) return filtered.filter(tr => new Date(tr.timestamp) >= new Date(now.getFullYear(), now.getMonth() - months, 1));
        }
        return filtered;
    }
  }, [trades, selectedAccount, timeframe, customMonth]);

  const wins = filteredTrades.filter(tr => tr.status === 'Win');
  const losses = filteredTrades.filter(tr => tr.status === 'Loss');
  const mistakes = filteredTrades.filter(tr => tr.isMistake).length;
  const winRate = filteredTrades.length === 0 ? 0 : Math.round((wins.length / filteredTrades.length) * 100);

  const netProfit = filteredTrades.reduce((acc, tr) => {
    const isPips = tr.riskUnit === 'Pips';
    const rp = parseFloat(tr.riskPercent) || 1;
    if (tr.status === 'Win') return acc + (isPips ? parseFloat(tr.rr || 0) * rp : parseFloat(tr.reward || 0));
    if (tr.status === 'Loss') return acc + (isPips ? -rp : -Math.abs(parseFloat(tr.risk || 0)));
    return acc;
  }, 0).toFixed(2);

  const grossProfit = wins.reduce((acc, tr) => {
    return acc + (tr.riskUnit === 'Pips' ? parseFloat(tr.rr || 0) * (parseFloat(tr.riskPercent) || 1) : parseFloat(tr.reward || 0));
  }, 0);
  const grossLoss = Math.abs(losses.reduce((acc, tr) => {
    return acc + (tr.riskUnit === 'Pips' ? parseFloat(tr.riskPercent) || 1 : Math.abs(parseFloat(tr.risk || 0)));
  }, 0));
  const profitFactor = grossLoss === 0 ? grossProfit.toFixed(2) : (grossProfit / grossLoss).toFixed(2);

  const gradeStats = ['A+', 'A', 'B', 'C', 'D'].map(grade => {
    const gt = filteredTrades.filter(tr => tr.grade === grade);
    const gw = gt.filter(tr => tr.status === 'Win');
    return { grade, count: gt.length, winRate: gt.length === 0 ? 0 : Math.round((gw.length / gt.length) * 100) };
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats = dayNames.map((day, i) => {
    const dt = filteredTrades.filter(tr => new Date(tr.timestamp).getDay() === i);
    const dw = dt.filter(tr => tr.status === 'Win').length;
    return { day, count: dt.length, winRate: dt.length === 0 ? 0 : Math.round((dw / dt.length) * 100) };
  }).filter(d => d.day !== 'Sun' && d.day !== 'Sat');

  const coachSections = generateSomCoachReport(filteredTrades, language);
  const coachColors = {
    success: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.4)' },
    danger: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.4)' },
    primary: { bg: 'rgba(56,189,248,0.07)', border: 'rgba(56,189,248,0.4)' },
    warning: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.4)' },
    neutral: { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.1)' }
  };

  const timeframes = ['This Week', 'This Month', 'Last 2 Months', 'Last 3 Months', 'Last 4 Months', 'Last 5 Months', 'Last 6 Months', 'Last 7 Months', 'Last 8 Months', 'Last 9 Months', 'Last 10 Months', 'Last 11 Months', 'Last 12 Months', 'All Time'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => window.history.back()} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px 14px', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            ← {t('back')}
          </button>
          <div>
            <h2 className="text-gradient" style={{ margin: 0 }}>{t('weeklyReview')}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '5px 0 0' }}>
              {language === 'so' ? 'Falanqayn ku salaysan xogta dhabta ah ee ganacsigaaga.' : 'Data-driven insights based on your actual execution history.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px' }}>
            <option value="All Accounts">All Accounts</option>
            {accounts.map(acc => <option key={acc._id} value={acc.name}>{acc.name}</option>)}
          </select>
          <select value={timeframe} onChange={e => setTimeframe(e.target.value)} style={{ padding: '8px 14px', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 'bold' }}>
            {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
            <option value="Custom Month">Custom Month</option>
          </select>
          {timeframe === 'Custom Month' && (
            <input type="month" value={customMonth} onChange={e => setCustomMonth(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }} />
          )}
        </div>
      </header>

      {/* CORE METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
        {[
          { label: t('totalTrades'), value: filteredTrades.length, color: 'var(--primary)' },
          { label: t('winRate'), value: `${winRate}%`, color: winRate >= 55 ? 'var(--success)' : 'var(--danger)' },
          { label: t('netProfit'), value: `${netProfit}%`, color: parseFloat(netProfit) >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: t('profitRatio'), value: profitFactor, color: parseFloat(profitFactor) >= 1.5 ? 'var(--success)' : 'var(--warning)' },
          { label: t('mistakes'), value: mistakes, color: mistakes > 2 ? 'var(--danger)' : 'var(--success)' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase' }}>{stat.label}</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', color: stat.color }}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* MOOD vs PERFORMANCE + DAY OF WEEK */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section className="glass-card" style={{ padding: '30px' }}>
          <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={18} color="var(--accent)" />
            {t('moodPerformanceTitle')}
          </h4>
          <MoodChart trades={filteredTrades} t={t} />
        </section>

        <section className="glass-card" style={{ padding: '30px' }}>
          <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="var(--accent)" />
            {t('bestDays')}
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', gap: '10px' }}>
            {dayStats.map((d, i) => {
              const maxWR = Math.max(...dayStats.map(x => x.winRate), 1);
              const height = (d.winRate / maxWR) * 140;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: d.winRate >= 60 ? 'var(--success)' : d.winRate >= 40 ? 'var(--primary)' : 'var(--danger)' }}>
                    {d.count > 0 ? `${d.winRate}%` : ''}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}px` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ width: '100%', background: d.winRate >= 60 ? 'var(--success)' : d.winRate >= 40 ? 'var(--primary)' : 'rgba(239,68,68,0.4)', borderRadius: '6px 6px 0 0', minHeight: d.count > 0 ? '5px' : '0' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.day}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.count}T</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* GRADE ANALYSIS */}
      <section className="glass-card" style={{ padding: '30px' }}>
        <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={18} color="var(--primary)" /> {t('edgeTitle')}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
          {gradeStats.map(stat => (
            <div key={stat.grade} style={{ textAlign: 'center' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: stat.winRate >= 60 ? 'rgba(16,185,129,0.15)' : stat.winRate >= 40 ? 'rgba(56,189,248,0.1)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${stat.winRate >= 60 ? 'var(--success)' : stat.winRate >= 40 ? 'var(--primary)' : 'var(--danger)'}`,
                fontSize: '1.4rem', fontWeight: '900'
              }}>
                {stat.grade}
              </div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: stat.winRate >= 60 ? 'var(--success)' : 'var(--text-main)' }}>{stat.winRate}%</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.count} trades</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWS CONFLICT SECTION */}
      {filteredTrades.some(t => t.newsConflict) && (
        <section className="glass-card" style={{ padding: '30px' }}>
          <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="var(--warning)" />
            {t('newsConflict')}
          </h4>
          {(() => {
            const conflicts = filteredTrades.filter(t => t.newsConflict);
            const cWins = conflicts.filter(t => t.status === 'Win');
            const cRate = Math.round((cWins.length / conflicts.length) * 100);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>{language === 'so' ? 'Trades Xilli News' : 'Trades During News'}</p>
                  <p style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--warning)' }}>{conflicts.length}</p>
                </div>
                <div style={{ background: cRate < 40 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>{t('winRate')}</p>
                  <p style={{ fontSize: '2rem', fontWeight: '900', color: cRate < 40 ? 'var(--danger)' : 'var(--success)' }}>{cRate}%</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>{language === 'so' ? 'Khasaare' : 'Losses'}</p>
                  <p style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--danger)' }}>{conflicts.length - cWins.length}</p>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* SOMCOACH SECTION */}
      <section className="glass-card" style={{ padding: '35px' }}>
        <h4 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Brain size={22} color="var(--primary)" />
          <span style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontSize: '1.2rem', fontWeight: '800'
          }}>
            {t('coachReview')}
          </span>
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            background: 'rgba(56,189,248,0.1)', padding: '3px 10px',
            borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)',
            WebkitTextFillColor: 'var(--text-muted)', WebkitBackgroundClip: 'unset'
          }}>
            {language === 'so' ? 'ALGORITHMIC • SOMALI' : 'ALGORITHMIC • ENGLISH'}
          </span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {coachSections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              style={{
                borderRadius: '14px',
                border: `1px solid ${coachColors[section.type]?.border || 'rgba(255,255,255,0.1)'}`,
                background: coachColors[section.type]?.bg || 'rgba(255,255,255,0.02)',
                overflow: 'hidden'
              }}
            >
              <div style={{
                padding: '14px 20px',
                borderBottom: `1px solid ${coachColors[section.type]?.border || 'rgba(255,255,255,0.05)'}`,
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.01)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>{section.title}</span>
              </div>
              <div style={{ padding: '18px 20px', fontSize: '0.9rem', lineHeight: '1.85', color: 'var(--text-muted)' }}>
                {section.body}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Review;
