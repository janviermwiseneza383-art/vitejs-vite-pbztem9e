import { useState, useEffect, type CSSProperties } from 'react';

type Lang = 'KINY' | 'ENG' | 'FRA';

interface Match {
  id: number;
  competition: { name: string; code: string; emblem?: string };
  status: string;
  minute?: number;
  matchday?: number;
  utcDate: string;
  venue?: string;
  homeTeam: { id: number; name: string; shortName?: string; crest?: string };
  awayTeam: { id: number; name: string; shortName?: string; crest?: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
}

const TEXT: Record<Lang, any> = {
  KINY: {
    all: 'Imikino Yose', search: 'Shakisha ikipe, umukinnyi cyangwa irushanwa...',
    up: '📅 Izaba', live: '🔴 Live', fin: '✅ Iyarangiye', yose: 'Yose',
    matchesTab: '⚽ Imikino', standingsTab: '🏆 Urutonde', scorersTab: '👟 Abatsinze', teamsTab: '🛡️ Amakipe',
    load: "Gushaka amakuru y'imikino...", none: 'Nta makuru abonetse muri iki cyiciro.',
    ft: 'FT', ht: 'HT', dev: 'Yakozwe na Janvier Mwiseneza',
    summary: 'Ibyabaye & Stats', lineups: 'Lineups & Bench', table: 'Urutonde', h2h: 'H2H',
    venue: 'Ikibuga', refLbl: 'Umusifuzi', coach: 'Umutoza', goals: 'Ibitego (Goals)',
    cards: 'Amakarita', subs: 'Abasimbuye (Subs)', stats: 'Imibare y’Umukino',
    starting: 'Ababanza mu kibuga (Starting XI)', bench: 'Abasimbura (Bench)',
    noTable: 'Urutonde ntirubonetse.', noH2h: 'Nta mikino yabanje ibonetse.',
    lineupWait: 'Abakinnyi babanza mu kibuga bashyirwaho hasigaye isaha 1 ngo umukino utangire.'
  },
  ENG: {
    all: 'All Matches', search: 'Search team, player or competition...',
    up: '📅 Upcoming', live: '🔴 Live', fin: '✅ Finished', yose: 'All',
    matchesTab: '⚽ Matches', standingsTab: '🏆 Standings', scorersTab: '👟 Top Scorers', teamsTab: '🛡️ Teams',
    load: 'Loading live data...', none: 'No data found in this category.',
    ft: 'FT', ht: 'HT', dev: 'Designed & Developed by Janvier Mwiseneza',
    summary: 'Events & Stats', lineups: 'Lineups & Bench', table: 'Table', h2h: 'H2H',
    venue: 'Stadium', refLbl: 'Referee', coach: 'Coach', goals: 'Goals',
    cards: 'Bookings', subs: 'Substitutions', stats: 'Match Statistics',
    starting: 'Starting XI', bench: 'Substitutes',
    noTable: 'Standings not available.', noH2h: 'No H2H history found.',
    lineupWait: 'Starting lineups are published ~1 hour before kickoff.'
  },
  FRA: {
    all: 'Tous les Matchs', search: 'Rechercher équipe ou compétition...',
    up: '📅 À Venir', live: '🔴 En Direct', fin: '✅ Terminés', yose: 'Tous',
    matchesTab: '⚽ Matchs', standingsTab: '🏆 Classement', scorersTab: '👟 Buteurs', teamsTab: '🛡️ Équipes',
    load: 'Chargement des données...', none: 'Aucune donnée trouvée.',
    ft: 'Terminé', ht: 'MT', dev: 'Conçu et Développé par Janvier Mwiseneza',
    summary: 'Faits & Stats', lineups: 'Compos & Banc', table: 'Classement', h2h: 'H2H',
    venue: 'Stade', refLbl: 'Arbitre', coach: 'Entraîneur', goals: 'Buts',
    cards: 'Cartons', subs: 'Remplacements', stats: 'Statistiques',
    starting: 'Onze de Départ', bench: 'Remplaçants',
    noTable: 'Classement non disponible.', noH2h: 'Aucun historique H2H.',
    lineupWait: 'Les compositions sont publiées ~1h avant le match.'
  },
};

export default function App() {
  const [lang, setLang] = useState<Lang>('KINY');
  const [competitions, setCompetitions] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('kus_comps_v3') || '[]'); } catch { return []; }
  });
  const [matches, setMatches] = useState<Match[]>(() => {
    try { return JSON.parse(localStorage.getItem('kus_matches_v3') || '[]'); } catch { return []; }
  });
  const [league, setLeague] = useState('ALL');
  const [mainView, setMainView] = useState<'MATCHES' | 'STANDINGS' | 'SCORERS' | 'TEAMS'>('MATCHES');
  const [tab, setTab] = useState('ALL');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(matches.length === 0);

  const [leagueTable, setLeagueTable] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [extraLoading, setExtraLoading] = useState(false);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [mTab, setMTab] = useState<'SUMMARY' | 'LINEUPS' | 'TABLE' | 'H2H'>('SUMMARY');
  const [detailData, setDetailData] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [h2hData, setH2hData] = useState<any[]>([]);
  const [mLoading, setMLoading] = useState(false);

  const t = TEXT[lang];

  useEffect(() => {
    fetch('/api/matches?type=competitions')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.competitions)) {
          setCompetitions(d.competitions);
          localStorage.setItem('kus_comps_v3', JSON.stringify(d.competitions));
        }
      })
      .catch(() => {});
  }, []);

  const loadMatches = async (targetLeague = league) => {
    if (matches.length === 0) setLoading(true);
    try {
      const url = targetLeague === 'ALL'
        ? '/api/matches'
        : `/api/matches?type=comp_matches&code=${targetLeague}`;
      const r = await fetch(url);
      const d = await r.json();
      if (Array.isArray(d.matches)) {
        setMatches(d.matches);
        if (targetLeague === 'ALL') {
          localStorage.setItem('kus_matches_v3', JSON.stringify(d.matches));
        }
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
    if (mainView === 'MATCHES') return;
    const targetCode = league === 'ALL' ? (competitions.at(0)?.code || 'PL') : league;
    if (league === 'ALL') setLeague(targetCode);

    const fetchExtra = async () => {
      setExtraLoading(true);
      try {
        if (mainView === 'STANDINGS') {
          const res = await fetch(`/api/matches?type=standings&code=${targetCode}`).then(r => r.json());
          const first = Array.isArray(res?.standings) ? res.standings.at(0) : null;
          setLeagueTable(first?.table || []);
        } else if (mainView === 'SCORERS') {
          const res = await fetch(`/api/matches?type=scorers&code=${targetCode}`).then(r => r.json());
          setScorers(res?.scorers || []);
        } else if (mainView === 'TEAMS') {
          const res = await fetch(`/api/matches?type=teams&code=${targetCode}`).then(r => r.json());
          setTeams(res?.teams || []);
        }
      } catch {}
      setExtraLoading(false);
    };
    fetchExtra();
  }, [mainView, league]);

  const openMatchCenter = async (m: Match) => {
    setSelectedMatch(m);
    setMTab('SUMMARY');
    setMLoading(true);
    setDetailData(null);
    setTableData([]);
    setH2hData([]);
    try {
      const [detRes, tblRes, h2hRes] = await Promise.all([
        fetch(`/api/matches?type=detail&id=${m.id}`).then(r => r.json()),
        fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()),
        fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()),
      ]);
      setDetailData(detRes);
      const firstStanding = Array.isArray(tblRes?.standings) ? tblRes.standings.at(0) : null;
      setTableData(firstStanding?.table || []);
      setH2hData(h2hRes?.matches || []);
    } catch {}
    setMLoading(false);
  };

  const list = matches.filter((m) => {
    const s = q.trim().toLowerCase();
    const okQ = !s || [m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some((v) => v?.toLowerCase().includes(s));
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

  const firstRef = Array.isArray(detailData?.referees) ? detailData.referees.at(0) : null;
  const goals = Array.isArray(detailData?.goals) ? detailData.goals : [];
  const bookings = Array.isArray(detailData?.bookings) ? detailData.bookings : [];
  const subs = Array.isArray(detailData?.substitutions) ? detailData.substitutions : [];
  const homeStats = detailData?.homeTeam?.statistics;
  const awayStats = detailData?.awayTeam?.statistics;

  return (
    <div style={st.wrap}>
      <header style={st.head}>
        <div style={st.hIn}>
          <div style={st.logoRow} onClick={() => { setMainView('MATCHES'); setLeague('ALL'); }}>
            <img src="/Kigali Update Score Sports Badge.png" alt="Kigali Update Score" style={st.logo} />
            <div>
              <h1 style={st.title}>Kigali Update Score</h1>
              <div style={st.sub}><span style={st.dot} /> LIVE SCORES • STATS • STANDINGS</div>
            </div>
          </div>
          <div style={st.langs}>
            {(['KINY', 'ENG', 'FRA'] as Lang[]).map((k) => (
              <button key={k} onClick={() => setLang(k)} style={{ ...st.lBtn, ...(lang === k ? st.lAct : {}) }}>{k}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={st.main}>
        {/* Search Bar */}
        <div style={st.sBox}>
          <span style={st.sIco}>🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} style={st.sInp} />
          {q && <button onClick={() => setQ('')} style={st.clr}>✕</button>}
        </div>

        {/* Navigation Tabs (No Refresh Button - Auto-Syncs Silently) */}
        <div style={st.modeRow}>
