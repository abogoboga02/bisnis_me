"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(query.matches);

    const listener = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
    };

    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  if (reduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
