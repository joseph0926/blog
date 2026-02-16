'use client';

import { Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';

const socialLinks = [
  {
    icon: Github,
    href: 'https://github.com/joseph0926',
    label: 'GitHub',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/joseph0926/',
    label: 'LinkedIn',
  },
  {
    icon: Mail,
    href: 'mailto:joseph0926.dev@gmail.com',
    label: 'Email',
  },
];

export const ProfileHero = () => {
  const t = useTranslations('about.profile');

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="py-16 text-center md:py-24"
    >
      <motion.div variants={staggerItem}>
        <span className="border-border bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
          {t('badge')}
        </span>
      </motion.div>

      <motion.h1
        variants={staggerItem}
        className="text-foreground mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        {t('name')}
      </motion.h1>

      <motion.p
        variants={staggerItem}
        className="text-muted-foreground mt-4 text-xl md:text-2xl"
      >
        {t('role')}
      </motion.p>

      <motion.p
        variants={staggerItem}
        className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
      >
        {t('summaryPrefix')}
        <strong className="text-foreground">{t('summaryHighlight')}</strong>
        {t('summarySuffix')}
      </motion.p>

      <motion.div
        variants={staggerItem}
        className="mt-8 flex items-center justify-center gap-4"
      >
        {socialLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-full border p-3 transition-colors duration-150"
          >
            <link.icon className="h-5 w-5" />
          </Link>
        ))}
      </motion.div>
    </motion.section>
  );
};
