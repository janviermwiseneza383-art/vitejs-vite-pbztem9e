import { useState, useEffect, type CSSProperties } from 'react';

type Lang = 'KINY' | 'ENG' | 'FRA';

const TEXT: Record<Lang, any> = {
  KINY: {
    all: 'Imikino Yose', search: 'Shakisha ikipe, umukinnyi cyangwa irushanwa...',
    up: '📅 Izaba', live: '🔴 Live', fin: '✅ Iyarangiye', yose: 'Yose',
    matchesTab: '⚽ Imikino', standingsTab: '🏆 Urutonde', scorersTab: '👟 Abatsinze', teamsTab: '🛡️ Amakipe',
    load: "Gushaka amakuru y'imikino...", none: 'Nta makuru abonetse.',
    ft: 'FT', dev: 'Yakozwe na Janvier Mwiseneza',
    summary: 'Ibyabaye & Stats', lineups: 'Lineups', table: 'Urutonde', h2h: 'H2H',
    venue: 'Ikibuga', refLbl: 'Umusifuzi', coach: 'Umutoza', goals: 'Ibitego',
    noTable: 'Urutonde ntirubonetse.', noH2h: 'Nta mikino yabanje ibonetse.',
    lineupWait: 'Abakinnyi babanza mu kibuga bashyirwaho hasigaye isaha 1 ngo umukino utangire.'
  },
  ENG: {
    all: 'All Matches', search: 'Search team, player or competition...',
    up: '📅 Upcoming', live: '🔴 Live', fin: '✅ Finished', yose: 'All',
    matchesTab: '⚽ Matches', standingsTab: '🏆 Standings', scorersTab: '👟 Top Scorers', teamsTab: '🛡️ Teams',
    load: 'Loading live data...', none: 'No data found.',
    ft: 'FT', dev: 'Designed & Developed by Janvier Mwiseneza',
    summary: 'Events & Stats', lineups: 'Lineups', table: 'Table', h2h: 'H2H',
    venue: 'Stadium', refLbl: 'Referee', coach: 'Coach', goals: 'Goals',
    noTable: 'Standings not available.', noH2h: 'No H2H history found.',
    lineupWait: 'Starting lineups are published ~1 hour before kickoff.'
  },
  FRA: {
    all: 'Tous les Matchs', search: 'Rechercher équipe ou compétition...',
    up: '📅 À Venir', live: '🔴 En Direct', fin: '✅ Terminés', yose: 'Tous',
    matchesTab: '⚽ Matchs', standingsTab: '🏆 Classement', scorersTab: '👟 Buteurs', teamsTab: '🛡️ Équipes',
    load: 'Chargement...', none: 'Aucune donnée trouvée.',
    ft: 'Terminé', dev: 'Conçu et Développé par Janvier Mwiseneza',
    summary: 'Faits & Stats', lineups: 'Compos', table: 'Classement', h2h: 'H2H',
    venue: 'Stade', refLbl: 'Arbitre', coach: 'Entraîneur', goals: 'Buts',
    noTable: 'Classement non disponible.', noH2h: 'Aucun historique H2H.',
    lineupWait: 'Les compositions sont publiées ~1h avant le match.'
  },
};

export default function App() {
  const [lang, setLang] = useState<Lang>('KINY');
  const [comps, setComps] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_c4') || '[]'); } catch { return []; } });
  const [matches, setMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kus_m4') || '[]'); } catch { return []; } });
  const [league, setLeague] = useState('ALL');
  const [view, setView] = useState<'MATCHES' | 'STANDINGS' | 'SCORERS' | 'TEAMS'>('MATCHES');
  const [tab, setTab] = useState('ALL');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(matches.length === 0);

  const [table, setTable] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [exLoad, setExLoad] = useState(false);

  const [sel, setSel] = useState<any>(null);
  const [mTab, setMTab] = useState<'SUMMARY' | 'LINEUPS' | 'TABLE' | 'H2H'>('SUMMARY');
  const [det, setDet] = useState<any>(null);
  const [mTbl, setMTbl] = useState<any[]>([]);
  const [h2h, setH2h] = useState<any[]>([]);
  const [mLoad, setMLoad] = useState(false);

  const t = TEXT[lang];

  useEffect(() => {
    fetch('/api/matches?type=competitions').then(r => r.json()).then(d => {
      if (Array.isArray(d.competitions)) { setComps(d.competitions); localStorage.setItem('kus_c4', JSON.stringify(d.competitions)); }
    }).catch(() => {});
  }, []);

  const loadMatches = async (lg = league) => {
    if (matches.length === 0) setLoading(true);
    try {
      const r = await fetch(lg === 'ALL' ? '/api/matches' : `/api/matches?type=comp_matches&code=${lg}`);
      const d = await r.json();
      if (Array.isArray(d.matches)) {
        setMatches(d.matches);
        if (lg === 'ALL') localStorage.setItem('kus_m4', JSON.stringify(d.matches));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadMatches(league);
    const i = setInterval(() => loadMatches(league), 30000);
    return () => clearInterval(i);
  }, [league]);

  useEffect(() => {
    if (view === 'MATCHES') return;
    const code = league === 'ALL' ? (comps.at(0)?.code || 'PL') : league;
    if (league === 'ALL') setLeague(code);
    setExLoad(true);
    const ep = view === 'STANDINGS' ? 'standings' : view === 'SCORERS' ? 'scorers' : 'teams';
    fetch(`/api/matches?type=${ep}&code=${code}`).then(r => r.json()).then(res => {
      if (view === 'STANDINGS') setTable((Array.isArray(res?.standings) ? res.standings.at(0)?.table : []) || []);
      if (view === 'SCORERS') setScorers(res?.scorers || []);
      if (view === 'TEAMS') setTeams(res?.teams || []);
    }).catch(() => {}).finally(() => setExLoad(false));
  }, [view, league]);

  const openMatch = async (m: any) => {
    setSel(m); setMTab('SUMMARY'); setMLoad(true); setDet(null); setMTbl([]); setH2h([]);
    try {
      const [d1, d2, d3] = await Promise.all([
        fetch(`/api/matches?type=detail&id=${m.id}`).then(r => r.json()),
        fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()),
        fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()),
      ]);
      setDet(d1);
      setMTbl((Array.isArray(d2?.standings) ? d2.standings.at(0)?.table : []) || []);
      setH2h(d3?.matches || []);
    } catch {}
    setMLoad(false);
  };

  const list = matches.filter((m) => {
    const s = q.trim().toLowerCase();
    const okQ = !s || [m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some(v => v?.toLowerCase().includes(s));
    if (!okQ) return false;
    if (tab === 'UPCOMING') return ['TIMED', 'SCHEDULED'].includes(m.status);
    if (tab === 'LIVE') return ['IN_PLAY', 'PAUSED'].includes(m.status);
    if (tab === 'FINISHED') return m.status === 'FINISHED';
    return true;
  });

  const fmt = (u: string) => {
    const d = new Date(u);
    return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const refObj = Array.isArray(det?.referees) ? det.referees.at(0) : null;

  return (
    <div style={st.wrap}>
      <header style={st.head}>
        <div style={st.hIn}>
          <div style={st.logoRow} onClick={() => { setView('MATCHES'); setLeague('ALL'); }}>
            <img src="/Kigali Update Score Sports Badge.png" alt="Logo" style={st.logo} />
            <div>
              <h1 style={st.title}>Kigali Update Score</h1>
              <div style={st.sub}><span style={st.dot} /> LIVE SCORES • STATS • STANDINGS</div>
            </div>
          </div>
          <div style={st.langs}>
            {(['KINY', 'ENG', 'FRA'] as Lang[]).map(k => (
              <button key={k} onClick={() => setLang(k)} style={{ ...st.lBtn, ...(lang === k ? st.lAct : {}) }}>{k}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={st.main}>
        <div style={st.sBox}>
          <span style={st.sIco}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.search} style={st.sInp} />
          {q && <button onClick={() => setQ('')} style={st.clr}>✕</button>}
        </div>

        <div style={st.modeRow}>
          <button onClick={() => setView('MATCHES')} style={{ ...st.modeBtn, ...(view === 'MATCHES' ? st.modeAct : {}) }}>{t.matchesTab}</button>
          <button onClick={() => setView('STANDINGS')} style={{ ...st.modeBtn, ...(view === 'STANDINGS' ? st.modeAct : {}) }}>{t.standingsTab}</button>
          <button onClick={() => setView('SCORERS')} style={{ ...st.modeBtn, ...(view === 'SCORERS' ? st.modeAct : {}) }}>{t.scorersTab}</button>
          <button onClick={() => setView('TEAMS')} style={{ ...st.modeBtn, ...(view === 'TEAMS' ? st.modeAct : {}) }}>{t.teamsTab}</button>
        </div>

        <div style={st.lBar}>
          <button onClick={() => { setView('MATCHES'); setLeague('ALL'); }} style={{ ...st.cBtn, ...(league === 'ALL' ? st.cAct : {}) }}>🌍 {t.all}</button>
          {comps.map((c: any) => (
            <button key={c.code} onClick={() => setLeague(c.code)} style={{ ...st.cBtn, ...(league === c.code ? st.cAct : {}) }}>
              {c.emblem && <img src={c.emblem} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />} {c.name}
            </button>
          ))}
        </div>

        {view === 'MATCHES' && (
          <>
            <div style={st.tabs}>
              {[{ id: 'ALL', l: `${t.yose} (${matches.length})` }, { id: 'LIVE', l: t.live }, { id: 'UPCOMING', l: t.up }, { id: 'FINISHED', l: t.fin }].map(b => (
                <button key={b.id} onClick={() => setTab(b.id)} style={{ ...st.tBtn, ...(tab === b.id ? st.tAct : {}) }}>{b.l}</button>
              ))}
            </div>
            {loading ? <div style={st.msg}>{t.load}</div> : list.length === 0 ? <div style={st.msg}>{t.none}</div> : (
              <div style={st.list}>
                {list.map(m => {
                  const live = ['IN_PLAY', 'PAUSED'].includes(m.status);
                  const fin = m.status === 'FINISHED';
                  return (
                    <div key={m.id} onClick={() => openMatch(m)} style={{ ...st.card, borderColor: live ? 'rgba(239,68,68,0.65)' : 'rgba(255,255,255,0.08)' }}>
                      <div style={st.cHead}>
                        <span style={st.lName}>{m.competition?.name}</span>
                        <span style={{ fontWeight: 700, color: live ? '#f87171' : fin ? '#94a3b8' : '#38bdf8' }}>
                          {live ? `● LIVE ${m.minute ? `${m.minute}'` : ''}` : fin ? `${t.ft} • ${fmt(m.utcDate)}` : fmt(m.utcDate)}
