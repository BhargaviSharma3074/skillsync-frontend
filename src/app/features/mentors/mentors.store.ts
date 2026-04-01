import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { MentorsService } from './mentors.service';
import { Mentor, MentorFilter } from './mentors.model';
import { firstValueFrom } from 'rxjs';

interface MentorsState {
  mentors: Mentor[];
  filter: MentorFilter;
  loading: boolean;
  selectedMentor: Mentor | null;
}

const initial: MentorsState = {
  mentors: [],
  filter: {},
  loading: false,
  selectedMentor: null
};

export const MentorsStore = signalStore(
  { providedIn: 'root' },
  withState(initial),
  withComputed((state) => ({
    filteredCount: computed(() => state.mentors().length),
    activeFilters: computed(() => {
      const f = state.filter();
      const chips: { label: string; key: string }[] = [];
      f.skills?.forEach(s => chips.push({ label: s, key: `skill_${s}` }));
      if (f.minRating) chips.push({ label: `${f.minRating}+`, key: 'rating' });
      if (f.maxRate) chips.push({ label: `<₹${f.maxRate}/hr`, key: 'maxRate' });
      return chips;
    })
  })),
  withMethods((store) => {
    const svc = inject(MentorsService);
    return {
      async search(filter?: MentorFilter) {
        const f = filter ?? store.filter();
        patchState(store, { loading: true, filter: f });
        try {
          const mentors = await firstValueFrom(svc.search(f));
          patchState(store, { mentors, loading: false });
        } catch {
          // Mock data
          patchState(store, {
            mentors: [
              { id:'1', name:'Priya Sharma', experience:8, rating:4.9, reviewCount:42, skills:['Spring Boot','Java','JPA'], hourlyRate:800, available:true, title:'Senior Backend Engineer' },
              { id:'2', name:'Arjun Mehta',  experience:5, rating:4.7, reviewCount:28, skills:['ML / AI','Python','TensorFlow'], hourlyRate:600, available:true },
              { id:'3', name:'Neha Kapoor',  experience:8, rating:4.8, reviewCount:35, skills:['React','Node.js','TypeScript'], hourlyRate:750, available:true },
              { id:'4', name:'Rahul Gupta',  experience:4, rating:4.6, reviewCount:19, skills:['DSA','Java','LeetCode'], hourlyRate:500, available:true },
              { id:'5', name:'Sanjay Kumar', experience:10, rating:4.95, reviewCount:87, skills:['Microservices','Docker'], hourlyRate:950, available:true },
              { id:'6', name:'Divya Verma',  experience:7, rating:4.7, reviewCount:31, skills:['Angular','RxJS','NgRx'], hourlyRate:700, available:true }
            ],
            loading: false
          });
        }
      },

      updateFilter(partial: Partial<MentorFilter>) {
        const newFilter = { ...store.filter(), ...partial };
        patchState(store, { filter: newFilter });
      },

      removeFilterChip(key: string) {
        const f = { ...store.filter() };
        if (key.startsWith('skill_')) {
          f.skills = f.skills?.filter(s => s !== key.replace('skill_', ''));
        }
        if (key === 'rating') f.minRating = undefined;
        if (key === 'maxRate') f.maxRate = undefined;
        patchState(store, { filter: f });
      },

      clearFilters() {
        patchState(store, { filter: {} });
      },

      async loadMentor(id: string) {
        try {
          const m = await firstValueFrom(svc.getById(id));
          patchState(store, { selectedMentor: m });
        } catch {
          const found = store.mentors().find(x => x.id === id) ?? null;
          patchState(store, { selectedMentor: found });
        }
      }
    };
  })
);