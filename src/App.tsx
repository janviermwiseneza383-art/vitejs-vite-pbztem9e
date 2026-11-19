import { useState, useEffect, type CSSProperties } from 'react';

type Lang = 'KINY' | 'ENG' | 'FRA';

interface Match {
  id: number;
  competition: { name: string; code: string };
  status: string;
  minute?: number;
  utcDate: string;
  venue?: string;
  homeTeam: { id: number; name: string; shortName?: string; crest?: string };
  awayTeam: { id: number; name: string; shortName?: string; crest?: string };
  score: { fullTime: { home: number | null; away: number | null } };
}

const TEXT: Record<Lang, any> = {
  KINY: {
    all: 'Amashampiyona Yose', intl: '🌍 Ibihugu (WC & Euro)', search: 'Shakisha ikipe cyangwa irushanwa...',
    up: '📅 Imikino Izaba', live: '🔴 Iri Kuba', fin: '✅ Iyarangiye', yose: 'Yose', ref: '🔄 Kuvugurura',
    load: "Gushaka amakuru y'imikino...", none: 'Nta mikino ibonetse.', ft: 'FT (Yarangiye)',
    dev: 'Yakozwe na Janvier Mwiseneza', info: 'Amakuru & Lineup', table: 'Urutonde (Table)', h2h: 'H2H (Byabanje)',
    venue: 'Ikibuga', refLbl: 'Umusifuzi', noTable: 'Urutonde rwa shampiyona ntirubonetse.', noH2h: 'Nta mikino yabanje ibonetse.',
    lineupWait: 'Abakinnyi babanza mu kibuga (Lineup) bashyirwaho hasigaye isaha 1 ngo umukino utangire.'
  },
  ENG: {
    all: 'All Competitions', intl: '🌍 International (WC & Euro)', search: 'Search teams or competitions...',
    up: '📅 Upcoming', live: '🔴 Live Now', fin: '✅ Finished', yose: 'All', ref: '🔄 Refresh',
    load: 'Loading matches...', none: 'No matches found.', ft: 'FT (Finished)',
    dev: 'Designed & Developed by Janvier Mwiseneza', info: 'Info & Lineup', table: 'Table', h2h: 'H2H',
    venue: 'Stadium', refLbl: 'Referee', noTable: 'Standings not available for this competition.', noH2h: 'No previous H2H matches found.',
    lineupWait: 'Official starting lineups are released ~1 hour before kickoff.'
  },
  FRA: {
    all: 'Toutes les Compétitions', intl: '🌍 Sélections (WC & Euro)', search: 'Rechercher une équipe...',
    up: '📅 À Venir', live: '🔴 En Direct', fin: '✅ Terminés', yose: 'Tous', ref: '🔄 Actualiser',
    load: 'Chargement...', none: 'Aucun match trouvé.', ft: 'Terminé',
    dev: 'Conçu et Développé par Janvier Mwiseneza', info: 'Infos & Compo', table: 'Classement', h2h: 'H2H',
    venue: 'Stade', refLbl: 'Arbitre', noTable: 'Classement non disponible.', noH2h: 'Aucun historique H2H trouvé.',
    lineupWait: 'Les compositions officielles sont publiées ~1h avant le coup d’envoi.'
  },
};

export default function App() {
  const [lang, setLang] = useState<Lang>('KINY');
  const [matches, setMatches] = useState<Match[]>(() => {
    try { return JSON.parse(localStorage.getItem('kus_matches') || '[]'); } catch { return []; }
  });
  const [league, setLeague] = useState('ALL');
  const [tab, setTab] = useState('UPCOMING');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(matches.length === 0);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [mTab, setMTab] = useState<'INFO' | 'TABLE' | 'H2H'>('TABLE');
  const [detailData, setDetailData] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [h2hData, setH2hData] = useState<any[]>([]);
  const [mLoading, setMLoading] = useState(false);

  const t = TEXT[lang];

  const leagues = [
    { c: 'ALL', n: t.all }, { c: 'INTL', n: t.intl }, { c: 'PL', n: 'Premier League' },
    { c: 'PD', n: 'La Liga' }, { c: 'SA', n: 'Serie A' }, { c: 'BL1', n: 'Bundesliga' },
    { c: 'FL1', n: 'Ligue 1' }, { c: 'CL', n: 'Champions League' },
  ];

  const load = async () => {
    if (matches.length === 0) setLoading(true);
    try {
      const r = await fetch('/api/matches');
      const d = await r.json();
      if (d.matches) {
        setMatches(d.matches);
        localStorage.setItem('kus_matches', JSON.stringify(d.matches));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, []);

  const openMatchCenter = async (m: Match) => {
    setSelectedMatch(m);
    setMTab('TABLE');
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
    const c = m.competition?.code || '';
    const okL = league === 'ALL' ? true : league === 'INTL' ? ['WC', 'EC', 'CLI'].includes(c) : c === league;
    const s = q.trim().toLowerCase();
    const okQ = !s || [m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some((v) => v?.toLowerCase().includes(s));
    if (!okL || !okQ) return false;
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

  return (
    <div style={st.wrap}>
      <header style={st.head}>
        <div style={st.hIn}>
          <div style={st.logoRow}>
            <img src="/Kigali Update Score Sports Badge.png" alt="Logo" style={st.logo} />
            <div>
              <h1 style={st.title}>Kigali Update Score</h1>
              <div style={st.sub}><span style={st.dot} /> LIVE SCORES & FIXTURES</div>
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
        <div style={st.sBox}>
          <span style={st.sIco}>🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} style={st.sInp} />
          {q && <button onClick={() => setQ('')} style={st.clr}>✕</button>}
        </div>

        <div style={st.tabs}>
          {[{ id: 'UPCOMING', l: t.up }, { id: 'LIVE', l: t.live }, { id: 'FINISHED', l: t.fin }, { id: 'ALL', l: t.yose }].map((b) => (
            <button key={b.id} onClick={() => setTab(b.id)} style={{ ...st.tBtn, ...(tab === b.id ? st.tAct : {}) }}>{b.l}</button>
          ))}
          <button onClick={load} style={st.ref}>{t.ref}</button>
        </div>

        <div style={st.lBar}>
          {leagues.map((l) => (
            <button key={l.c} onClick={() => setLeague(l.c)} style={{ ...st.cBtn, ...(league === l.c ? st.cAct : {}) }}>{l.n}</button>
          ))}
        </div>

        {loading ? <div style={st.msg}>{t.load}</div> : list.length === 0 ? <div style={st.msg}>{t.none}</div> : (
          <div style={st.list}>
            {list.map((m) => {
              const live = ['IN_PLAY', 'PAUSED'].includes(m.status);
              const fin = m.status === 'FINISHED';
              return (
                <div key={m.id} onClick={() => openMatchCenter(m)} style={st.card}>
                  <div style={st.cHead}>
                    <span style={st.lName}>{m.competition?.name}</span>
                    <span style={{ fontWeight: 700, color: live ? '#ff4d4f' : fin ? '#9ca3af' : '#38bdf8' }}>
                      {live ? `LIVE ${m.minute ? `${m.minute}'` : ''}` : fin ? t.ft : fmt(m.utcDate)}
                    </span>
                  </div>
                  <div style={st.teams}>
                    <div style={st.side}>
                      {m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" style={st.crest} />}
                      <span style={st.tName}>{m.homeTeam.shortName || m.homeTeam.name}</span>
                    </div>
                    <div style={st.score}>
                      <span>{m.score.fullTime.home ?? '-'}</span>
                      <span style={{ color: '#6b7280' }}>:</span>
                      <span>{m.score.fullTime.away ?? '-'}</span>
                    </div>
                    <div style={{ ...st.side, justifyContent: 'flex-end' }}>
                      <span style={st.tName}>{m.awayTeam.shortName || m.awayTeam.name}</span>
                      {m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" style={st.crest} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedMatch && (
        <div style={st.modalBg} onClick={() => setSelectedMatch(null)}>
          <div style={st.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={st.mTop}>
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 700 }}>{selectedMatch.competition?.name}</span>
              <button onClick={() => setSelectedMatch(null)} style={st.closeBtn}>✕</button>
            </div>

            <div style={st.mHero}>
              <div style={st.mTeam}>
                {selectedMatch.homeTeam.crest && <img src={selectedMatch.homeTeam.crest} alt="" style={st.mCrest} />}
                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{selectedMatch.homeTeam.shortName || selectedMatch.homeTeam.name}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
