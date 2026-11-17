import { useState, useEffect, CSSProperties } from 'react';

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

const LEAGUES = [
  { code: 'ALL', name: 'Amashampiyona Yose' },
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'La Liga' },
  { code: 'SA', name: 'Serie A' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'CL', name: 'Champions League' },
];

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches');
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
    const leagueMatch =
      selectedLeague === 'ALL' || match.competition?.code === selectedLeague;
    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
    const isFinished = match.status === 'FINISHED';

    if (statusFilter === 'LIVE') return leagueMatch && isLive;
    if (statusFilter === 'FINISHED') return leagueMatch && isFinished;
    return leagueMatch;
  });

  const formatTime = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoGroup}>
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
            <h1 style={styles.title}>Kigali Update Score</h1>
          </div>
          <div style={styles.liveBadge}>
            <span style={styles.liveDot}></span> LIVE
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.tabsRow}>
          {[
            { id: 'ALL', label: 'Imikino Yose' },
            { id: 'LIVE', label: '🔴 Iri Kuba (Live)' },
            { id: 'FINISHED', label: 'Iyarangiye' },
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
            🔄 Kuvugurura
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
          <div style={styles.centerText}>Gushaka amakuru y'imikino...</div>
        ) : filteredMatches.length === 0 ? (
          <div style={styles.centerText}>Nta mikino ibonetse muri iki cyiciro uyu munsi.</div>
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
                        ? 'FT (Yarangiye)'
                        : formatTime(match.utcDate)}
                    </span>
                  </div>

                  <div style={styles.teamsRow}>
                    <div style={styles.teamSide}>
                      {match.homeTeam.crest && (
                        <img src={match.homeTeam.crest} alt="" style={styles.crest} />
                      )}
                      <span style={styles.teamName}>
                        {match.homeTeam.shortName || match.homeTeam.name}
                      </span>
                    </div>

                    <div style={styles.scoreBox}>
                      <span>{match.score.fullTime.home ?? '-'}</span>
                      <span style={styles.scoreDivider}>:</span>
                      <span>{match.score.fullTime.away ?? '-'}</span>
                    </div>

                    <div style={{ ...styles.teamSide, justifyContent: 'flex-end' }}>
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
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0b0f19',
    color: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: '#111827',
    borderBottom: '1px solid #1f2937',
    padding: '16px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 800,
    letterSpacing: '0.5px',
    color: '#ffffff',
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    border: '1px solid rgba(239, 68, 68, 0.4)',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px 16px',
  },
  tabsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  tabBtn: {
    backgroundColor: '#1f2937',
    color: '#d1d5db',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  tabBtnActive: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
  refreshBtn: {
    marginLeft: 'auto',
    backgroundColor: '#111827',
    color: '#9ca3af',
    border: '1px solid #374151',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  leagueBar: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  leagueBtn: {
    backgroundColor: '#111827',
    color: '#9ca3af',
    border: '1px solid #1f2937',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  leagueBtnActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderColor: '#2563eb',
  },
  matchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  matchCard: {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '12px',
    padding: '14px 16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '12px',
  },
  leagueName: {
    color: '#9ca3af',
    fontWeight: 600,
  },
  statusTag: {
    fontWeight: 700,
  },
  teamsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '12px',
  },
  teamSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  crest: {
    width: '24px',
    height: '24px',
    objectFit: 'contain',
  },
  teamName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#f9fafb',
  },
  scoreBox: {
    backgroundColor: '#1f2937',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 800,
    display: 'flex',
    gap: '6px',
    color: '#ffffff',
  },
  scoreDivider: {
    color: '#6b7280',
  },
    centerText: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#9ca3af',
  },
};

