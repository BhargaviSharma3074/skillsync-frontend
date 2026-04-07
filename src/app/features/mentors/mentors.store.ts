import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { MentorsService } from './mentors.service';
import { Mentor, MentorFilter } from './mentors.model';
import { firstValueFrom } from 'rxjs';

interface MentorsState {
  mentors: Mentor[];
  selectedMentor: Mentor | null;
  loading: boolean;
  error: string | null;
  filter: MentorFilter;
}

export const MentorsStore = signalStore(
  { providedIn: 'root' },
  withState<MentorsState>({
    mentors: [],
    selectedMentor: null,
    loading: false,
    error: null,
    filter: {}
  }),
  // ✅ ADD THIS BLOCK to fix the HTML errors
  withComputed((store) => ({
    filteredCount: computed(() => store.mentors().length),
    
    activeFilters: computed(() => {
      const f = store.filter();
      const chips: { key: keyof MentorFilter; label: string; value: any }[] = [];

      if (f.search) chips.push({ key: 'search', label: 'Search', value: f.search });
      if (f.skills && f.skills.length > 0) chips.push({ key: 'skills', label: 'Skills', value: f.skills.join(', ') });
      if (f.minRating) chips.push({ key: 'minRating', label: 'Rating', value: `${f.minRating}★+` });
      if (f.maxRate) chips.push({ key: 'maxRate', label: 'Max Rate', value: `₹${f.maxRate}/hr` });
      if (f.minExperience) chips.push({ key: 'minExperience', label: 'Experience', value: `${f.minExperience}+ yrs` });
      if (f.availability) chips.push({ key: 'availability', label: 'Available', value: 'Yes' });

      return chips;
    })
  })),
  withMethods((store) => {
    const mentorsService = inject(MentorsService);

    return {
      async loadMentors(filter?: MentorFilter) {
        const currentFilter = filter || store.filter();
        patchState(store, { loading: true, error: null, filter: currentFilter });

        try {
          const mentors = await firstValueFrom(mentorsService.search(currentFilter));
          patchState(store, { mentors, loading: false });
        } catch (err: any) {
          patchState(store, {
            loading: false,
            error: err?.error?.message || 'Failed to load mentors'
          });
        }
      },

      async loadMentorById(id: string) {
        patchState(store, { loading: true, error: null });
        try {
          const mentor = await firstValueFrom(mentorsService.getById(id));
          patchState(store, { selectedMentor: mentor, loading: false });
        } catch (err: any) {
          patchState(store, { loading: false, error: 'Mentor not found' });
        }
      },

      async loadMentor(id: string) {
        return this.loadMentorById(id);
      },

      async search() {
        await this.loadMentors(store.filter());
      },

      updateFilter(partialFilter: Partial<MentorFilter>) {
        patchState(store, { filter: { ...store.filter(), ...partialFilter } });
      },

      removeFilterChip(key: keyof MentorFilter) {
        const currentFilter = { ...store.filter() };
        delete currentFilter[key];
        patchState(store, { filter: currentFilter });
      },

      clearFilters() {
        patchState(store, { filter: {} });
      },

      clearError() {
        patchState(store, { error: null });
      }
    };
  })
);