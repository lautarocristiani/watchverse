import { Github, Linkedin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-6 border-t border-border-light dark:border-border-dark">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm text-center md:text-left">
          © {new Date().getFullYear()} Watchverse. Created by Lautaro Cristiani.
        </p>
        
        <div className="flex items-center gap-4">
          <a href="https://github.com/lautarocristiani" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary transition-colors">
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/lautaro-cristiani-sanes" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary transition-colors">
            <Linkedin size={20} />
          </a>
        </div>

        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm text-center md:text-right">
          This project uses the {' '}
          <a 
            href="https://www.themoviedb.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            TMDB API
          </a> 
          {' '} but is not endorsed by TMDB.
        </p>
      </div>
    </footer>
  );
}