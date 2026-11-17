import { useState, useEffect, type CSSProperties } from 'react';

type Lang = 'KINY' | 'ENG' | 'FRA';

interface Match {
  id: number;
  competition: { name: string; code: string };
  status: string;
  minute?: number;
  utcDate: string;
  homeTeam: { name: string; shortName?: string; crest?: string };
  awayTeam: { name: string; shortName?: string; crest?: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

const TRANSLATIONS: Record<Lang, {
  allLeagues: string;
  intlLeagues: string;
  searchPlaceholder: string;
  upcomingTab: string;
  liveTab: string;
  finishedTab: string;
  allTab: string;
  refresh: string;
  loading: string;
  noMatches: string;
  finishedTag: string;
  designedBy: string;
}> = {
  KINY: {
    allLeagues: 'Amashampiyona Yose',
    intlLeagues: '🌍 Ibihugu (WC & Euro)',
    searchPlaceholder: 'Shakisha ikipe cyangwa irushanwa...',
    upcomingTab: '📅 Imikino Izaba',
    liveTab: '🔴 Iri Kuba (Live)',
    finishedTab: '✅ Iyarangiye',
    allTab: 'Yose',
    refresh: '🔄 Kuvugurura',
    loading: "Gushaka amakuru y'imikino...",
    noMatches: 'Nta mikino ibonetse muri iki cyiciro.',
    finishedTag: 'FT (Yarangiye)',
    designedBy: 'Yakozwe na Janvier Mwiseneza',
  },
  ENG: {
    allLeagues: 'All Competitions',
    intlLeagues: '🌍 International (WC & Euro)',
    searchPlaceholder: 'Search teams or competitions...',
    upcomingTab: '📅 Upcoming',
    liveTab: '🔴 Live Now',
    finishedTab: '✅ Finished',
    allTab: 'All',
    refresh: '🔄 Refresh',
    loading: 'Loading matches...',
    noMatches: 'No matches found in this category.',
    finishedTag: 'FT (Finished)',
    designedBy: 'Designed & Developed by Janvier Mwiseneza',
  },
  FRA: {
    allLeagues: 'Toutes les Compétitions',
    intlLeagues: '🌍 Sélections (WC & Euro)',
    searchPlaceholder: 'Rechercher une équipe ou compétition...',
    upcomingTab: '📅 À Venir',
    liveTab: '🔴 En Direct',
    finishedTab: '✅ Terminés',
    allTab: 'Tous',
    refresh: '🔄 Actualiser',
    loading: 'Chargement des matchs...',
    noMatches: 'Aucun match trouvé dans cette catégorie.',
    finishedTag: 'Terminé',
    designedBy: 'Conçu et Développé par Janvier Mwiseneza',
  },
};

export default function App() {
  const [lang, setLang] = useState<Lang>('KINY');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const t = TRANSLATIONS[lang];

  const LEAGUES = [
    { code: 'ALL', name: t.allLeagues },
    { code: 'INTL', name: t.intlLeagues },
    { code: 'PL', name: 'Premier League' },
    { code: 'PD', name: 'La Liga' },
    { code: 'SA', name: 'Serie A' },
    { code: 'BL1', name: 'Bundesliga' },
    { code: 'FL1', name: 'Ligue 1' },
    { code: 'CL', name: 'Champions League' },
  ];

  const getDateRange = () => {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    const end = new Date();
    end.setDate(end.getDate() + 10);
    return {
        dateFrom: start.toISOString().split('T')[0],
      dateTo: end.toISOString().split('T')[0],

    };
  };

  const fetchMatches = async () => {
    setLoading(true);
    const { dateFrom, dateTo } = getDateRange();
    try {
      const response = await fetch(`/api/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredMatches = matches.filter((match) => {
    const code = match.competition?.code || '';
    const leagueMatch =
      selectedLeague === 'ALL'
        ? true
        : selectedLeague === 'INTL'
        ? code === 'WC' || code === 'EC' || code === 'CLI'
        : code === selectedLeague;

    const q = searchQuery.trim().toLowerCase();
    const searchMatch =
      !q ||
      match.homeTeam?.name?.toLowerCase().includes(q) ||
      match.homeTeam?.shortName?.toLowerCase().includes(q) ||
      match.awayTeam?.name?.toLowerCase().includes(q) ||
      match.awayTeam?.shortName?.toLowerCase().includes(q) ||
      match.competition?.name?.toLowerCase().includes(q);

    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
    const isFinished = match.status === 'FINISHED';
    const isUpcoming = match.status === 'TIMED' || match.status === 'SCHEDULED';

    if (!leagueMatch || !searchMatch) return false;
    if (statusFilter === 'UPCOMING') return isUpcoming;
    if (statusFilter === 'LIVE') return isLive;
    if (statusFilter === 'FINISHED') return isFinished;
    return true;
  });

  const formatMatchDateTime = (utcDate: string) => {
    const date = new Date(utcDate);
    const dayStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dayStr} • ${timeStr}`;
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoGro}>
            <img
                            src="https://postimg.cc"

              alt="Kigali Update Score"
              style={{
                height: '52px',
                width: 'auto',
                borderRadius: '8px',
                objectFit: 'contain',
              }}
            />
            <div>
              <h1 style={styles.title}>Kigali Update Score</h1>
              <div style={styles.liveSubBadge}>
                <span style={styles.liveDot}></span> LIVE SCORES & FIXTURES
              </div>
            </div>
          </div>

          <div style={styles.langGroup}>
            {(['KINY', 'ENG', 'FRA'] as Lang[]).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                style={{
                  ...styles.langBtn,
                  ...(lang === code ? styles.langBtnActive : {}),
                }}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.searchWrapper}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={styles.searchIcon}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={styles.clearBtn}>
              ✕
            </button>
          )}
        </div>

        <div style={styles.tabsRow}>
          {[
            { id: 'UPCOMING', label: t.upcomingTab },
            { id: 'LIVE', label: t.liveTab },
            { id: 'FINISHED', label: t.finishedTab },
            { id: 'ALL', label: t.allTab },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                ...styles.tabBtn,
                ...(statusFilter === tab.id ? styles.tabBtnActive : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
          <button onClick={fetchMatches} style={styles.refreshBtn}>
            {t.refresh}
          </button>
        </div>

        <div style={styles.leagueBar}>
          {LEAGUES.map((league) => (
            <button
              key={league.code}
              onClick={() => setSelectedLeague(league.code)}
              style={{
                ...styles.leagueBtn,
                ...(selectedLeague === league.code ? styles.leagueBtnActive : {}),
              }}
            >
              {league.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.centerText}>{t.loading}</div>
        ) : filteredMatches.length === 0 ? (
          <div style={styles.centerText}>{t.noMatches}</div>
        ) : (
          <div style={styles.matchList}>
            {filteredMatches.map((match) => {
              const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
              const isFinished = match.status === 'FINISHED';

              return (
                <div key={match.id} style={styles.matchCard}>
                  <div style={styles.cardHeader}>
                    <span style={styles.leagueName}>{match.competition?.name}</span>
                    <span
                      style={{
                        ...styles.statusTag,
                        color: isLive ? '#ff4d4f' : isFinished ? '#9ca3af' : '#38bdf8',
                      }}
                    >
                      {isLive
                        ? `LIVE ${match.minute ? `${match.minute}'` : ''}`
                        : isFinished
                        ? t.finishedTag
                        : formatMatchDateTime(match.utcDate)}
                    </span>
                  </div>

                  <div style={styles.teamsRow}>
                    <div style={styles.teamSide}>
                                            <span style={styles.teamName}>
                        {match.awayTeam.shortName || match.awayTeam.name}
                      </span>
                      {match.awayTeam.crest && (
                        <img src={match.awayTeam.crest} alt="" style={styles.crest} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} <strong>Kigali Update Score</strong> • {t.designedBy}
        </p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b0f19', color: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' },
  header: { backgroundColor: '#111827', borderBottom: '1px solid #1f2937', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 },
  headerContent: { maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px', color: '#ffffff' },
  liveSubBadge: { display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '11px', fontWeight: 700, marginTop: '2px' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' },
  langGroup: { display: 'flex', gap: '6px', backgroundColor: '#0b0f19', padding: '4px', borderRadius: '8px', border: '1px solid #1f2937' },
  langBtn: { backgroundColor: 'transparent', color: '#9ca3af', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 },
  langBtnActive: { backgroundColor: '#2563eb', color: '#ffffff' },
  main: { flex: 1, width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px 16px', boxSizing: 'border-box' },
  searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '16px' },
  searchIcon: { position: 'absolute', left: '14px', pointerEvents: 'none' },
  searchInput: { width: '100%', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '24px', padding: '11px 40px 11px 42px', color: '#ffffff', fontSize: '14px', outline: 'none' },
  clearBtn: { position: 'absolute', right: '14px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' },
  tabsRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' },
  tabBtn: { backgroundColor: '#1f2937', color: '#d1d5db', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  tabBtnActive: { backgroundColor: '#ef4444', color: '#ffffff' },
  refreshBtn: { marginLeft: 'auto', backgroundColor: '#111827', color: '#9ca3af', border: '1px solid #374151', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  leagueBar: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' },
  leagueBtn: { backgroundColor: '#111827', color: '#9ca3af', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' },
  leagueBtnActive: { backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' },
  matchList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  matchCard: { backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '14px 16px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px' },
  leagueName: { color: '#9ca3af', fontWeight: 600 },
  statusTag: { fontWeight: 700 },
  teamsRow: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px' },
  teamSide: { display: 'flex', alignItems: 'center', gap: '10px' },
  crest: { width: '24px', height: '24px', objectFit: 'contain' },
  teamName: { fontSize: '15px', fontWeight: 600, color: '#f9fafb' },
  scoreBox: { backgroundColor: '#1f2937', padding: '6px 14px', borderRadius: '8px', fontSize: '18px', fontWeight: 800, display: 'flex', gap: '6px', color: '#ffffff' },
  scoreDivider: { color: '#6b7280' },
  centerText: { textAlign: 'center', padding: '40px 0', color: '#9ca3af' },
  footer: { backgroundColor: '#111827', borderTop: '1px solid #1f2937', padding: '18px 20px', textAlign: 'center', marginTop: 'auto' },
  footerText: { margin: 0, fontSize: '13px', color: '#9ca3af' },
};

