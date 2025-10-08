'use client';

import { Genre } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, Fragment } from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

interface FilterBarProps {
    genres: Genre[];
}

const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Rating' },
    { value: 'primary_release_date.desc', label: 'Newest' },
    { value: 'primary_release_date.asc', label: 'Oldest' },
];

export default function FilterBar({ genres }: FilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set(name, value)
          if (name !== 'page') {
            params.set('page', '1')
          }
          return params.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (name: 'genre' | 'sort', value: string) => {
        router.push(pathname + '?' + createQueryString(name, value));
    };

    const findLabel = (options: {value: string, label: string}[], value: string) => {
        return options.find(opt => opt.value === value)?.label;
    }
    const findGenreLabel = (genres: Genre[], value: string) => {
        return genres.find(g => String(g.id) === value)?.name;
    }

    const selectedGenre = searchParams.get('genre') || '';
    const selectedSort = searchParams.get('sort') || 'popularity.desc';

    return (
        <div className="bg-card-light p-4 rounded-lg border border-border-light flex flex-col sm:flex-row items-center gap-4 dark:bg-card-dark dark:border-border-dark">
            <div className="flex-1 w-full min-w-[150px]">
                <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Genre</label>
                <Listbox value={selectedGenre} onChange={(value) => handleFilterChange('genre', value)}>
                    <div className="relative">
                        <ListboxButton className="relative w-full cursor-default rounded-md bg-background-light py-2 pl-3 pr-10 text-left border border-border-light focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm h-10 dark:bg-background-dark dark:border-border-dark">
                            <span className="block truncate">{findGenreLabel(genres, selectedGenre) || 'All Genres'}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronDown className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" aria-hidden="true" />
                            </span>
                        </ListboxButton>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card-light py-1 text-base shadow-lg ring-1 ring-border-light focus:outline-none sm:text-sm dark:bg-card-dark dark:ring-border-dark">
                                <ListboxOption value="" className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-hover-light text-text-main-light dark:bg-hover-dark dark:text-text-main-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium text-primary' : 'font-normal'}`}>All Genres</span>
                                            {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><Check className="h-5 w-5" aria-hidden="true" /></span>}
                                        </>
                                    )}
                                </ListboxOption>
                                {genres.map((genre) => (
                                    <ListboxOption key={genre.id} value={String(genre.id)} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-hover-light text-text-main-light dark:bg-hover-dark dark:text-text-main-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-medium text-primary' : 'font-normal'}`}>{genre.name}</span>
                                                {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><Check className="h-5 w-5" aria-hidden="true" /></span>}
                                            </>
                                        )}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Transition>
                    </div>
                </Listbox>
            </div>
            <div className="flex-1 w-full min-w-[150px]">
                <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Sort By</label>
                <Listbox value={selectedSort} onChange={(value) => handleFilterChange('sort', value)}>
                    <div className="relative">
                        <ListboxButton className="relative w-full cursor-default rounded-md bg-background-light py-2 pl-3 pr-10 text-left border border-border-light focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm h-10 dark:bg-background-dark dark:border-border-dark">
                            <span className="block truncate">{findLabel(sortOptions, selectedSort) || 'Popularity'}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronDown className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" aria-hidden="true" />
                            </span>
                        </ListboxButton>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card-light py-1 text-base shadow-lg ring-1 ring-border-light focus:outline-none sm:text-sm dark:bg-card-dark dark:ring-border-dark">
                                {sortOptions.map((option) => (
                                    <ListboxOption key={option.value} value={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-hover-light text-text-main-light dark:bg-hover-dark dark:text-text-main-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-medium text-primary' : 'font-normal'}`}>{option.label}</span>
                                                {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><Check className="h-5 w-5" aria-hidden="true" /></span>}
                                            </>
                                        )}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Transition>
                    </div>
                </Listbox>
            </div>
        </div>
    );
}