
import React from 'react';
import type { ServiceOption } from './types';

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'numerology',
    name: 'Numerology',
    description: 'Uncover the secrets hidden in your name and birth date.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    path: '/numerology',
  },
  {
    id: 'astrology',
    name: 'Astrology',
    description: 'Explore your destiny written in the stars and planets.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    path: '/astrology',
  },
  {
    id: 'tarot',
    name: 'Tarot',
    description: 'Draw a card and gain insight into your past, present, and future.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    path: '/tarot',
  },
  {
    id: 'palmistry',
    name: 'Palmistry',
    description: 'Read the lines on your hand to understand your character and future.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    path: '/palmistry',
  },
  {
    id: 'face-reading',
    name: 'Face Reading',
    description: 'Discover what your facial features reveal about your personality.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/face-reading',
  },
  {
    id: 'remedy',
    name: 'Personal Guidance',
    description: 'Get personalized remedies and guidance for your life challenges.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/remedy',
  },
];

export const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1531162232855-369463387517?q=80&w=1920',
  'https://images.unsplash.com/photo-1515524738708-327f6b0037a2?q=80&w=1920',
  'https://images.unsplash.com/photo-1605333116398-1c39a3f898e3?q=80&w=1920',
  'https://images.unsplash.com/photo-1590387120759-4f86a5578507?q=80&w=1920',
];
