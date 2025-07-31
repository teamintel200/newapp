import { create } from 'zustand'

export interface VoiceSettings {
  speed: number;
  accent: 'jessica' | 'chulsoo';
}

export interface Section {
  id: string;
  title: string;
  text: string;
  image?: string;
}

export interface GlobalSettings {
  videoTitle: string;
  brightness: number;
  contrast: number;
  saturation: number;
  musicVolume: number;
  voiceVolume: number;
  watermark: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  outputQuality: 'HD' | 'FHD' | '4K';
  background: 'black' | 'white' | 'custom';
  customBackgroundImage?: string;
  voiceSettings: VoiceSettings;
}

interface VideoStore {
  sections: Section[];
  globalSettings: GlobalSettings;
  selectedSectionId: string;
  
  // Section actions
  setSections: (sections: Section[]) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  addSection: (section: Section) => void;
  removeSection: (sectionId: string) => void;
  mergeSections: (currentSectionId: string) => void;
  
  // Global settings actions
  setGlobalSettings: (settings: GlobalSettings) => void;
  updateGlobalSetting: <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => void;
  
  // UI state actions
  setSelectedSectionId: (id: string) => void;
  
  // Reset actions
  reset: () => void;
}

const defaultGlobalSettings: GlobalSettings = {
  videoTitle: 'My YouTube Short',
  brightness: 100,
  contrast: 100,
  saturation: 100,
  musicVolume: 50,
  voiceVolume: 80,
  watermark: '',
  aspectRatio: '9:16',
  outputQuality: 'FHD',
  background: 'black',
  customBackgroundImage: undefined,
  voiceSettings: {
    speed: 1,
    accent: 'jessica'
  }
};

export const useVideoStore = create<VideoStore>()((set, get) => ({
  sections: [],
  globalSettings: defaultGlobalSettings,
  selectedSectionId: '',
  
  setSections: (sections) => {
    set({ sections });
    // Auto-select first section if none selected
    if (sections.length > 0 && !get().selectedSectionId) {
      set({ selectedSectionId: sections[0].id });
    }
  },
  
  updateSection: (sectionId, updates) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  },
  
  addSection: (section) => {
    set((state) => ({
      sections: [...state.sections, section]
    }));
  },
  
  removeSection: (sectionId) => {
    set((state) => {
      const newSections = state.sections.filter((section) => section.id !== sectionId);
      const newSelectedId = state.selectedSectionId === sectionId 
        ? (newSections.length > 0 ? newSections[0].id : '')
        : state.selectedSectionId;
      
      return {
        sections: newSections,
        selectedSectionId: newSelectedId
      };
    });
  },
  
  mergeSections: (currentSectionId) => {
    set((state) => {
      const currentIndex = state.sections.findIndex(section => section.id === currentSectionId);
      
      // Can't merge if it's the first section or section not found
      if (currentIndex <= 0) return state;
      
      const previousSection = state.sections[currentIndex - 1];
      const currentSection = state.sections[currentIndex];
      
      // Create merged section with combined text and previous section's metadata
      const mergedSection: Section = {
        ...previousSection, // Keep previous section's metadata (title, image)
        text: `${previousSection.text} ${currentSection.text}`.trim()
      };
      
      // Create new sections array without current section and with updated previous section
      const newSections = [
        ...state.sections.slice(0, currentIndex - 1),
        mergedSection,
        ...state.sections.slice(currentIndex + 1)
      ];
      
      // Update selected section to the merged one
      const newSelectedId = state.selectedSectionId === currentSectionId 
        ? previousSection.id 
        : state.selectedSectionId;
      
      return {
        sections: newSections,
        selectedSectionId: newSelectedId
      };
    });
  },
  
  setGlobalSettings: (settings) => {
    set({ globalSettings: settings });
  },
  
  updateGlobalSetting: (key, value) => {
    set((state) => ({
      globalSettings: {
        ...state.globalSettings,
        [key]: value
      }
    }));
  },
  
  setSelectedSectionId: (id) => {
    set({ selectedSectionId: id });
  },
  
  reset: () => {
    set({
      sections: [],
      globalSettings: defaultGlobalSettings,
      selectedSectionId: ''
    });
  }
}));