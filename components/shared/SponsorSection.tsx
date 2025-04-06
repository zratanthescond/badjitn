"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useAnimation,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { useTheme } from "next-themes";
import { Star, Sparkles, Award, Shield } from "lucide-react";
import { IUserSponsor } from "@/lib/database/models/userSponser.model";
import { useGetEventSponsors } from "@/hooks/useGetEventSponsors";

interface SponsorProps {
  name: string;
  logo: string;
  color: string;
  glowColor: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  delay?: number;
}

const TierBadge = ({ tier }: { tier: string }) => {
  const badges = {
    platinum: {
      icon: Award,
      color: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
    },
    gold: {
      icon: Star,
      color: "bg-gradient-to-r from-amber-300 to-yellow-500",
    },
    silver: {
      icon: Shield,
      color: "bg-gradient-to-r from-gray-300 to-gray-400",
    },
    bronze: {
      icon: Sparkles,
      color: "bg-gradient-to-r from-amber-700 to-yellow-800",
    },
  };

  const BadgeIcon = badges[tier as keyof typeof badges]?.icon || Star;
  const badgeColor =
    badges[tier as keyof typeof badges]?.color || "bg-blue-500";

  return (
    <div
      className={`absolute -top-3 -right-3 z-20 ${badgeColor} p-1.5 rounded-full shadow-lg`}
    >
      <BadgeIcon size={12} className="text-white" />
    </div>
  );
};

const Sponsor = ({
  name,
  logo,
  color,
  glowColor,
  tier,
  delay = 0,
}: SponsorProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);
  const colorsConfig = {
    platinum: {
      color: "bg-gradient-to-br from-indigo-600/90 to-indigo-800/90",
      glowColor: "bg-indigo-600",
      tier: "platinum",
      delay: 0,
    },
    gold: {
      color: "bg-gradient-to-br from-amber-600/90 to-amber-800/90",
      glowColor: "bg-amber-600",
      tier: "gold",
      delay: 1,
    },
    silver: {
      color: "bg-gradient-to-br from-gray-600/90 to-gray-800/90",
      glowColor: "bg-gray-600",
      tier: "silver",
      delay: 2,
    },
    bronze: {
      color: "bg-gradient-to-br from-amber-600/90 to-amber-800/90",
      glowColor: "bg-amber-600",
      tier: "bronze",
      delay: 3,
    },
  };

  const variants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: colorsConfig[tier].delay * 0.15,
        ease: [0.21, 0.45, 0.15, 1.2],
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.7,
          delay: colorsConfig[tier].delay * 0.15,
          ease: [0.21, 0.45, 0.15, 1.2],
        },
      }}
      className="relative group max-w-[100px] cursor-pointer max-h-[100px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow effect */}
      <motion.div
        initial="initial"
        animate="pulse"
        variants={pulseVariants}
        className={`absolute inset-0 ${colorsConfig[tier].glowColor} opacity-50 rounded-full blur-3xl`}
        style={{ transform: "scale(1.2)" }}
      />

      {/* Inner container */}
      <div className="relative perspective-effect">
        <motion.div
          animate={{
            rotateY: isHovered ? [0, -5, 5, 0] : 0,
            rotateX: isHovered ? [0, 3, -3, 0] : 0,
            scale: isHovered ? 1.08 : 1,
            transition: { duration: 0.4, type: "tween", stiffness: 300 },
          }}
          className="relative z-10"
        >
          <div
            className={`p-1 transition-all duration-500 ${
              isHovered ? "opacity-100" : "opacity-90"
            }`}
          >
            <div
              className={`hexagon-container ${colorsConfig[tier].color} backdrop-blur-md border border-white/20 shadow-2xl transform-style-3d`}
            >
              {/* Shine effect */}
              <div
                className={`absolute inset-0 shine-effect ${
                  isHovered ? "opacity-40" : "opacity-0"
                } transition-opacity duration-300`}
              ></div>

              {/* Inner content */}
              <div className="hexagon-inner bg-gradient-to-br from-white/95 to-white/85 flex items-center justify-center p-5">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt={name}
                  fill
                  objectFit="contain"
                  className="object-contain transition-all duration-500 drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating name tag */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-1 left-1/4 transform -translate-x-1/4 bg-black/80 backdrop-blur-md text-white text-xs font-medium px-4 py-1.5 rounded-full whitespace-nowrap shadow-xl border border-white/10 z-20"
            >
              {name}
              <TierBadge tier={tier} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function SponsorsSection({
  sponsorsIds,
}: {
  sponsorsIds: string[];
}) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const titleControls = useAnimation();
  const {
    data: sponsors,
    isPending,
    refetch,
  } = useGetEventSponsors(sponsorsIds);
  useEffect(() => {
    setMounted(true);
    if (isInView) {
      titleControls.start("visible");
    }
  }, [isInView, titleControls]);

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.45, 0.15, 1.2],
      },
    },
  };
  //const sponsorsWithColor=sponsors.map((sponsor)=>{return{...sponsor,color:}})
  if (!mounted) return null;

  return (
    <>
      {isPending ? (
        <div></div>
      ) : (
        <section
          ref={sectionRef}
          className="relative p-2 rounded-xl w-full overflow-hidden  bg-gradient-to-b from-card/30 via-card/50 to-card/70"
        >
          {/* Animated background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute w-full h-full">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
                {/* Animated gradient orbs */}
                <motion.div
                  animate={{
                    x: [0, 20, -20, 0],
                    y: [0, -30, 30, 0],
                    scale: [1, 1.1, 0.9, 1],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    x: [0, -40, 40, 0],
                    y: [0, 40, -40, 0],
                    scale: [1, 0.8, 1.2, 1],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    x: [0, 30, -30, 0],
                    y: [0, -20, 20, 0],
                    scale: [1, 1.2, 0.8, 1],
                  }}
                  transition={{
                    duration: 30,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="absolute bottom-1/4 left-1/3 w-[28rem] h-[28rem] bg-emerald-500/20 rounded-full blur-3xl"
                />
              </div>
            </div>

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          </div>

          {/* Content container */}
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial="hidden"
              animate={titleControls}
              variants={titleVariants}
              className="text-center mb-2"
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.21, 0.45, 0.15, 1.2],
                },
              }}
            >
              <div className="inline-block w-full mb-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase bg-white/10 text-foreground/70 px-3 py-1 rounded-full mb-1">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Our Valued Partners</span>
                </span>
              </div>

              <h2 className="text-lg md:text-lg font-bold mb-2 relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-card-foreground/10 via-gray-400 to-card-foreground/10">
                  Trusted by Industry Leaders
                </span>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -bottom-3 left-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-full"
                />
              </h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="text-gray-400 mt-2 max-w-sm mx-auto text-sm"
              >
                We collaborate with forward-thinking organizations to create
                exceptional experiences
              </motion.p>
            </motion.div>

            {/* Sponsors grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 items-center justify-items-center mb-4">
              {sponsors &&
                sponsors?.data.map((sponsor, index) => (
                  <Sponsor key={index} {...sponsor} />
                ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
