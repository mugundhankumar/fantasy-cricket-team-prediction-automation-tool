import { create } from 'zustand';

const useStore = create((set) => ({
  // Matches State
  matches: [],
  setMatches: (matches) => set({ matches }),
  
  // Match Selection State
  selectedMatch: null,
  setSelectedMatch: (match) => set({ selectedMatch: match }),

  // Player Selection State
  team1Players: [],
  team2Players: [],
  setTeam1Players: (players) => set({ team1Players: players }),
  setTeam2Players: (players) => set({ team2Players: players }),

  // Team Generation State
  generatedTeams: [],
  setGeneratedTeams: (teams) => set({ generatedTeams: teams }),

  // Filter State
  filters: {
    date: '',
    format: '',
    league: '',
    country: '',
  },
  setFilters: (filters) => set({ filters }),

  // Loading States
  isLoading: {
    matches: false,
    prediction: false,
    teamGeneration: false,
  },
  setLoading: (key, value) => 
    set((state) => ({
      isLoading: { ...state.isLoading, [key]: value }
    })),

  // Error States
  errors: {
    matches: null,
    prediction: null,
    teamGeneration: null,
  },
  setError: (key, error) =>
    set((state) => ({
      errors: { ...state.errors, [key]: error }
    })),

  // Clear all errors
  clearErrors: () => set({ errors: {} }),

  // Reset store
  reset: () => set({
    selectedMatch: null,
    team1Players: [],
    team2Players: [],
    generatedTeams: [],
    filters: {
      date: '',
      format: '',
      league: '',
      country: '',
    },
    isLoading: {
      matches: false,
      prediction: false,
      teamGeneration: false,
    },
    errors: {},
  }),
}));

export default useStore;
