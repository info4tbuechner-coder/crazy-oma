
import React from 'react';
import { Disclosure, Tab } from '@headlessui/react';
import Card from './ui/Card';
import { NARCISSISTIC_PATTERNS_DETAILS } from '../constants';

const HelpPage: React.FC = () => {
    return (
        <Card className="animate-fade-in border-slate-800">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-display text-white">Klinisches Glossar</h2>
                    <p className="text-slate-500 text-sm uppercase tracking-widest font-semibold mt-1">Linguistische & Psychologische Marker</p>
                </div>
            </div>

            <div className="grid gap-4">
                {NARCISSISTIC_PATTERNS_DETAILS.map((pattern) => (
                    <Disclosure key={pattern.name}>
                        {({ open }) => (
                            <div className={`rounded-2xl border transition-all duration-300 ${open ? 'bg-slate-900 border-slate-700 shadow-xl' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
                                <Disclosure.Button className="flex justify-between items-center w-full px-6 py-5 text-left focus:outline-none">
                                    <span className={`font-bold transition-colors ${open ? 'text-brand-primary' : 'text-slate-200'}`}>{pattern.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </Disclosure.Button>
                                
                                <Disclosure.Panel className="px-6 pb-6 animate-fade-in">
                                    <Tab.Group>
                                        <Tab.List className="flex p-1 space-x-1 bg-slate-950 rounded-xl mb-6 max-w-xs border border-slate-800">
                                            <Tab className={({ selected }) => `w-full py-2 text-xs font-bold rounded-lg transition-all focus:outline-none ${selected ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>PHÄNOMENOLOGIE</Tab>
                                            <Tab className={({ selected }) => `w-full py-2 text-xs font-bold rounded-lg transition-all focus:outline-none ${selected ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>WISSENSCHAFT</Tab>
                                        </Tab.List>
                                        <Tab.Panels>
                                            <Tab.Panel className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800 italic">
                                                "{pattern.simple}"
                                            </Tab.Panel>
                                            <Tab.Panel className="text-slate-400 text-sm leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                                {pattern.scientific}
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </Disclosure.Panel>
                            </div>
                        )}
                    </Disclosure>
                ))}
            </div>
        </Card>
    );
}

export default HelpPage;
