// app/store/analysisStore.js
import { create } from 'zustand';

const useAnalysisStore = create((set) => ({
  // Global issue counters
  totalIssues: 0,
  criticalIssues: 0,
  
  // Agent-specific counters
  agentIssues: {
    dataStructure: 0,
    maintainability: 0,
    compliance: 0,
    optimization: 0
  },
  
  agentCriticalIssues: {
    dataStructure: 0,
    maintainability: 0,
    compliance: 0,
    optimization: 0
  },
  
  // File data
  files: [],
  
  // Actions to update state
  addAgentIssues: (agent, issues, critical) => set((state) => ({
    totalIssues: state.totalIssues + issues,
    criticalIssues: state.criticalIssues + critical,
    agentIssues: {
      ...state.agentIssues,
      [agent]: issues
    },
    agentCriticalIssues: {
      ...state.agentCriticalIssues,
      [agent]: critical
    }
  })),
  
  setFiles: (files) => set({ files }),
  
  resetAll: () => set({
    totalIssues: 0,
    criticalIssues: 0,
    agentIssues: {
      dataStructure: 0,
      maintainability: 0,
      compliance: 0,
      optimization: 0
    },
    agentCriticalIssues: {
      dataStructure: 0,
      maintainability: 0,
      compliance: 0,
      optimization: 0
    },
    files: []
  })
}));

export default useAnalysisStore;