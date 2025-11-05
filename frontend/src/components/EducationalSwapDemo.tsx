import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface Person {
  id: string;
  name: string;
  avatarUrl: string;
  currentLocation: string;
  newLocation: string;
  startPos: Position;
  targetPos: Position;
}

interface Doctor {
  id: string;
  location: string;
  pos: Position;
  avatarUrl: string;
}

const EducationalSwapDemo = () => {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  // Data: positions are relative (0-1) for responsive design
  const doctors: Doctor[] = [
    {
      id: "doc1",
      location: "Groningen",
      pos: { x: 0.65, y: 0.2 },
      avatarUrl: "https://avatar.iran.liara.run/public?username=doc-groningen",
    },
    {
      id: "doc2",
      location: "Zwolle",
      pos: { x: 0.6, y: 0.45 },
      avatarUrl: "https://avatar.iran.liara.run/public?username=doc-zwolle",
    },
    {
      id: "doc3",
      location: "Den Haag",
      pos: { x: 0.25, y: 0.65 },
      avatarUrl: "https://avatar.iran.liara.run/public?username=doc-denhaag",
    },
    {
      id: "doc4",
      location: "Leeuwarden",
      pos: { x: 0.5, y: 0.12 },
      avatarUrl: "https://avatar.iran.liara.run/public?username=doc-leeuwarden",
    },
  ];

  const people: Person[] = [
    {
      id: "p1",
      name: "Henk",
      avatarUrl: "https://avatar.iran.liara.run/public/boy?username=Henk",
      currentLocation: "Groningen",
      newLocation: "Zwolle",
      startPos: { x: 0.65, y: 0.2 },
      targetPos: { x: 0.6, y: 0.45 },
    },
    {
      id: "p2",
      name: "Maria",
      avatarUrl: "https://avatar.iran.liara.run/public/girl?username=Maria",
      currentLocation: "Zwolle",
      newLocation: "Den Haag",
      startPos: { x: 0.6, y: 0.45 },
      targetPos: { x: 0.25, y: 0.65 },
    },
    {
      id: "p3",
      name: "Frank",
      avatarUrl: "https://avatar.iran.liara.run/public?username=Frank",
      currentLocation: "Den Haag",
      newLocation: "Leeuwarden",
      startPos: { x: 0.25, y: 0.65 },
      targetPos: { x: 0.5, y: 0.12 },
    },
    {
      id: "p4",
      name: "Anne",
      avatarUrl: "https://avatar.iran.liara.run/public/girl?username=Anne",
      currentLocation: "Leeuwarden",
      newLocation: "Groningen",
      startPos: { x: 0.5, y: 0.12 },
      targetPos: { x: 0.65, y: 0.2 },
    },
  ];

  const stepDescriptions = [
    "4 mensen hebben een huisarts. Ze gaan verhuizen naar een nieuwe stad.",
    "Iedereen wil een huisarts dicht bij hun nieuwe huis. De lijnen tonen waar ze naartoe willen.",
    "Iedereen verhuist tegelijk naar hun nieuwe stad. Dit heet een 'ruil cirkel'.",
    "Klaar! Iedereen heeft nu een huisarts dicht bij hun nieuwe huis.",
  ];

  const getLabelText = (person: Person) => {
    switch (step) {
      case 0:
        return `Woont in ${person.currentLocation}`;
      case 1:
        return `Wil naar ${person.newLocation}`;
      case 2:
        return `Verhuist naar ${person.newLocation}`;
      case 3:
        return `Nieuwe huisarts in ${person.newLocation}`;
      default:
        return "";
    }
  };

  return (
    <div className="relative w-full h-[70vh] bg-gradient-to-r from-sky-200 via-sky-200 to-teal-200">
      {/* Background map */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'url("/nlmap.svg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* SVG for lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#4FACFE"
              opacity={step >= 1 ? 1 : 0}
            />
          </marker>
        </defs>

        {/* Connection lines */}
        {step >= 1 &&
          people.map((person, idx) => {
            const doctor = doctors.find((d) => d.location === person.newLocation);
            if (!doctor) return null;

            // Calculate current position based on step
            const startX = step >= 2 ? person.targetPos.x : person.startPos.x;
            const startY = step >= 2 ? person.targetPos.y : person.startPos.y;

            return (
              <motion.line
                key={`line-${person.id}`}
                x1={`${startX * 100}%`}
                y1={`${startY * 100}%`}
                x2={`${doctor.pos.x * 100}%`}
                y2={`${doctor.pos.y * 100}%`}
                stroke={step === 3 ? "#10B981" : "#4FACFE"}
                strokeWidth={step === 3 ? "4" : "3"}
                strokeDasharray={step === 1 ? "8,8" : "0"}
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: 0.8,
                }}
                transition={{
                  duration: 1.5,
                  delay: idx * 0.2,
                  ease: "easeInOut",
                }}
              />
            );
          })}
      </svg>

      {/* Doctors (fixed positions) */}
      {people.map((person, idx) => {
        const doctor = doctors.find((d) => d.location === person.currentLocation);
        if (!doctor) return null;

        return (
          <motion.div
            key={`doctor-${doctor.id}`}
            className="absolute"
            style={{
              left: `${doctor.pos.x * 100}%`,
              top: `${doctor.pos.y * 100}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <div className="flex flex-col items-center gap-1">
              <Avatar className="w-10 h-10 border-2 border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-200">
                <AvatarImage
                  src={doctor.avatarUrl}
                  alt={`Huisarts ${doctor.location}`}
                />
              </Avatar>
              <div className="text-xs font-semibold text-slate-700 bg-white bg-opacity-80 px-2 py-0.5 rounded whitespace-nowrap">
                Huisarts {doctor.location}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* People (animated positions) */}
      {people.map((person, idx) => {
        const currentPos = step >= 2 ? person.targetPos : person.startPos;

        return (
          <motion.div
            key={`person-${person.id}`}
            className="absolute"
            style={{
              zIndex: 20,
            }}
            initial={{
              left: `${person.startPos.x * 100}%`,
              top: `${person.startPos.y * 100}%`,
              x: "-50%",
              y: "-50%",
              scale: 0,
              opacity: 0,
            }}
            animate={{
              left: `${currentPos.x * 100}%`,
              top: `${currentPos.y * 100}%`,
              x: "-50%",
              y: "-50%",
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: step === 2 ? 2 : 0.5,
              delay: step === 2 ? idx * 0.3 : idx * 0.1,
              ease: "easeInOut",
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-14 h-14 border-3 border-white shadow-lg">
                <AvatarImage src={person.avatarUrl} alt={person.name} />
              </Avatar>

              {/* Label */}
              <motion.div
                className="text-center text-xs font-semibold text-slate-900 bg-white px-3 py-1 rounded-full whitespace-nowrap shadow-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="font-bold">{person.name}</div>
                <div className="text-blue-600 text-[10px]">
                  {getLabelText(person)}
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
      })}

      {/* Controls and description overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent text-white p-6 z-30">
        <div className="max-w-4xl mx-auto">
          {/* Step indicator */}
          <div className="text-center mb-3">
            <span className="text-sm font-medium opacity-75">
              Stap {step + 1} van {totalSteps}
            </span>
          </div>

          {/* Description */}
          <motion.p
            key={step}
            className="text-center text-lg mb-6 min-h-[3rem] flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {stepDescriptions[step]}
          </motion.p>

          {/* Controls */}
          <div className="flex gap-3 items-center justify-center">
            <Button
              onClick={() => setStep(0)}
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              disabled={step === 0}
            >
              ↻ Opnieuw
            </Button>

            <Button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              ← Vorige
            </Button>

            <Button
              onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
              disabled={step === totalSteps - 1}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {step === totalSteps - 1 ? "Voltooid!" : "Volgende →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalSwapDemo;
