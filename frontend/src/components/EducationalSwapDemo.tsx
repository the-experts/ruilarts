import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
  color: string;
}

const EducationalSwapDemo = ({
  withDescription = true,
}: {
  withDescription?: boolean;
}) => {
  const [step, setStep] = useState(0);
  const [animProgress, setAnimProgress] = useState(0);
  const totalSteps = 4;

  const locations = {
    p1: {
      name: "Zwolle",
      pos: { x: 0.65, y: 0.2 },
      color: "#3B82F6", // blue
    },
    p2: {
      name: "Utrecht",
      pos: { x: 0.42, y: 0.51 },
      color: "#10B981", // green
    },
    p3: {
      name: "Rotterdam",
      pos: { x: 0.25, y: 0.65 },
      color: "#8B5CF6", // purple
    },
    p4: {
      name: "Haarlem",
      pos: { x: 0.3, y: 0.28 },
      color: "#F59E0B", // orange
    },
  };

  // Data: positions are relative (0-1) for responsive design
  const doctors: Doctor[] = [
    {
      id: "doc1",
      location: locations.p1.name,
      pos: locations.p1.pos,
      avatarUrl: "./avatars/doc-1.png",
      color: locations.p1.color,
    },
    {
      id: "doc2",
      location: locations.p2.name,
      pos: locations.p2.pos,
      avatarUrl: "./avatars/doc-2.png",
      color: locations.p2.color,
    },
    {
      id: "doc3",
      location: locations.p3.name,
      pos: locations.p3.pos,
      avatarUrl: "./avatars/doc-3.png",
      color: locations.p3.color,
    },
    {
      id: "doc4",
      location: locations.p4.name,
      pos: locations.p4.pos,
      avatarUrl: "./avatars/doc-4.png",
      color: locations.p4.color,
    },
  ];

  // Offset for people to be slightly right of their doctor
  const personOffset = { x: 0.008, y: 0.03 };

  const people: Person[] = [
    {
      id: "p1",
      name: "Henk",
      avatarUrl: "./avatars/henk.png",
      currentLocation: locations.p1.name,
      newLocation: locations.p2.name,
      startPos: {
        x: locations.p1.pos.x + personOffset.x,
        y: locations.p1.pos.y + personOffset.y,
      },
      targetPos: {
        x: locations.p2.pos.x + personOffset.x,
        y: locations.p2.pos.y + personOffset.y,
      },
    },
    {
      id: "p2",
      name: "Maria",
      avatarUrl: "./avatars/maria.png",
      currentLocation: locations.p2.name,
      newLocation: locations.p3.name,
      startPos: {
        x: locations.p2.pos.x + personOffset.x,
        y: locations.p2.pos.y + personOffset.y,
      },
      targetPos: {
        x: locations.p3.pos.x + personOffset.x,
        y: locations.p3.pos.y,
      },
    },
    {
      id: "p3",
      name: "Frank",
      avatarUrl: "./avatars/frank.png",
      currentLocation: locations.p3.name,
      newLocation: locations.p4.name,
      startPos: {
        x: locations.p3.pos.x + personOffset.x,
        y: locations.p3.pos.y + personOffset.y,
      },
      targetPos: {
        x: locations.p4.pos.x + personOffset.x,
        y: locations.p4.pos.y + personOffset.y,
      },
    },
    {
      id: "p4",
      name: "Anne",
      avatarUrl: "/avatars/anne.png",
      currentLocation: locations.p4.name,
      newLocation: locations.p1.name,
      startPos: {
        x: locations.p4.pos.x + personOffset.x,
        y: locations.p4.pos.y + personOffset.y,
      },
      targetPos: {
        x: locations.p1.pos.x + personOffset.x,
        y: locations.p1.pos.y + personOffset.y,
      },
    },
  ];

  // Real distances between cities (in km)
  const realDistances: Record<string, number> = {
    "Zwolle-Utrecht": 70,
    "Utrecht-Rotterdam": 60,
    "Rotterdam-Haarlem": 60,
    "Haarlem-Zwolle": 110,
  };

  const getRealDistance = (from: string, to: string): number => {
    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`;
    return realDistances[key1] || realDistances[key2] || 70;
  };

  const stepDescriptions = [
    "4 mensen hebben een huisarts. Ze gaan verhuizen naar een nieuwe stad.",
    "Iedereen wil een huisarts dicht bij hun nieuwe huis. De lijnen tonen waar ze naartoe willen.",
    "Iedereen verhuist onafhankelijk van elkaar naar een nieuwe stad, maar behouden tijdelijk hun oude huisarts totdat zij een nieuwe hebben gevonden.",
    "Dus, ruilen maar! Via Ruil Arts krijgt iedereen een huisarts dicht bij hun nieuwe huis.",
  ];

  // Calculate curved path points (quadratic bezier)
  const getCurvedPath = (start: Position, end: Position, progress: number) => {
    // Control point: midpoint with upward offset
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const controlY = midY - 0.15; // Hop upward

    // Quadratic Bezier formula
    const t = progress;
    const x =
      (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * midX + t * t * end.x;
    const y =
      (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlY + t * t * end.y;

    return { x, y, controlX: midX, controlY };
  };

  // Get SVG path for curved line
  const getCurvedSVGPath = (start: Position, end: Position) => {
    const { controlX, controlY } = getCurvedPath(start, end, 0.5);
    return `M ${start.x * 100} ${start.y * 100} Q ${controlX * 100} ${controlY * 100} ${end.x * 100} ${end.y * 100}`;
  };

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

  const getColorForLocation = (location: string) => {
    const loc = Object.values(locations).find((l) => l.name === location);
    return loc?.color || "#3B82F6";
  };

  const getCurrentColor = (person: Person) => {
    // Color swaps for everyone when step 3 is reached
    if (step >= 3) {
      return getColorForLocation(person.newLocation);
    }
    return getColorForLocation(person.currentLocation);
  };

  // Helper to get avatar center position in SVG coordinates
  const getAvatarCenter = (pos: Position, isPerson: boolean) => {
    // Base position in SVG coordinates (0-100)
    const x = pos.x * 100;
    const y = pos.y * 100;

    if (isPerson) {
      // People: translate(-35%, 25%) + avatar center
      // Need to offset to actual visual center of avatar
      return { x: x + 4.5, y: y + 5 };
    } else {
      // Doctors: translate(-50%, -50%) + label above + avatar
      // Need to offset down to avatar center below label
      return { x: x + 3.5, y: y + 3 };
    }
  };

  // Animate progress during step 2
  useEffect(() => {
    if (step === 2) {
      const duration = 2000; // 2 seconds per person
      const staggerDelay = 300; // 300ms delay between people
      const totalDuration = duration + staggerDelay * (people.length - 1);
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        setAnimProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setAnimProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Calculate individual person progress with stagger
  const getPersonProgress = (idx: number): number => {
    if (step !== 2) return 0;

    const staggerDelay = 300; // 300ms
    const duration = 2000; // 2 seconds
    const totalDuration = duration + staggerDelay * (people.length - 1);
    const personDelay = idx * staggerDelay;

    // Calculate how much of the total time has passed
    const elapsed = animProgress * totalDuration;

    // Subtract this person's delay
    const personElapsed = Math.max(0, elapsed - personDelay);

    // Calculate their individual progress (0 to 1)
    return Math.min(personElapsed / duration, 1);
  };

  return (
    <div className="relative w-full aspect-video bg-gradient-to-r from-sky-200 via-sky-200 to-teal-200">
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
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 5 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#4FACFE" />
          </marker>
          <marker
            id="arrowhead-green"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
          </marker>
        </defs>

        {/* Destination lines (to new doctor) - curved */}
        {(step === 1 || step === 3) &&
          people.map((person, idx) => {
            const doctor = doctors.find(
              (d) => d.location === person.newLocation,
            );
            if (!doctor) return null;

            // Get avatar centers for proper line alignment
            const startCenter = getAvatarCenter(person.startPos, true);
            const endCenter = getAvatarCenter(doctor.pos, false);

            // Create curved path between centers
            const midX = (startCenter.x + endCenter.x) / 2;
            const midY = (startCenter.y + endCenter.y) / 2;
            const controlY = midY - 15; // Hop upward

            const pathData = `M ${startCenter.x} ${startCenter.y} Q ${midX} ${controlY} ${endCenter.x} ${endCenter.y}`;

            return (
              <motion.path
                key={`dest-line-${person.id}`}
                d={pathData}
                stroke={step === 3 ? "#10B981" : "#4FACFE"}
                strokeWidth="0.5"
                fill="none"
                strokeDasharray={step === 1 ? "2,2" : "0"}
                markerEnd={
                  step === 1 ? "url(#arrowhead-blue)" : "url(#arrowhead-green)"
                }
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

        {/* Current connection lines (to old doctor during movement) - straight, red */}
        {step === 2 &&
          people.map((person, idx) => {
            const oldDoctor = doctors.find(
              (d) => d.location === person.currentLocation,
            );
            if (!oldDoctor) return null;

            // Get this person's individual progress (staggered)
            const personProgress = getPersonProgress(idx);

            // Calculate current position along curved path
            const currentPos = getCurvedPath(
              person.startPos,
              person.targetPos,
              personProgress,
            );

            // Get avatar centers for proper line alignment
            const personCenter = getAvatarCenter(currentPos, true);
            const doctorCenter = getAvatarCenter(oldDoctor.pos, false);

            // Use real distance for this journey
            const totalDistance = getRealDistance(
              person.currentLocation,
              person.newLocation,
            );
            const displayDistance = Math.round(totalDistance * personProgress);

            // Position label offset to avoid line overlap
            const midX = (personCenter.x + doctorCenter.x) / 2;
            const midY = (personCenter.y + doctorCenter.y) / 2;

            // Offset labels vertically based on index to avoid overlap
            const labelOffsetY = (idx - 1.5) * 2.5;

            // Only show if person has started moving
            if (personProgress === 0) return null;

            return (
              <g key={`current-line-${person.id}`}>
                <motion.line
                  x1={personCenter.x}
                  y1={personCenter.y}
                  x2={doctorCenter.x}
                  y2={doctorCenter.y + 3}
                  stroke="#EF4444"
                  strokeWidth="0.25"
                  strokeDasharray="1,1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Distance label with background */}
                {/*<g>
                  <rect
                    x={midX - 3}
                    y={midY + labelOffsetY - 1.2}
                    width="6"
                    height="2.5"
                    fill="white"
                    opacity="0.9"
                    rx="2"
                  />
                  <text
                    x={midX}
                    y={midY + labelOffsetY + 0.2}
                    fill="#DC2626"
                    fontSize="1"
                    fontWeight="600"
                    fontFamily='"Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {displayDistance}km
                  </text>
                </g>*/}
              </g>
            );
          })}
      </svg>

      {/* Doctors (fixed positions) */}
      {doctors.map((doctor, idx) => {
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
              <div
                className="text-xs font-semibold text-white px-2 py-0.5 rounded whitespace-nowrap"
                style={{ backgroundColor: doctor.color }}
              >
                Huisarts {doctor.location}
              </div>
              <Avatar
                className="w-10 h-10 border-2 shadow-lg"
                style={{ borderColor: "white" }}
              >
                <AvatarImage
                  src={doctor.avatarUrl}
                  alt={`Huisarts ${doctor.location}`}
                />
              </Avatar>
            </div>
          </motion.div>
        );
      })}

      {/* People (animated positions) */}
      {people.map((person, idx) => {
        let currentPos = person.startPos;

        if (step === 2) {
          // Follow curved path during movement with individual staggered progress
          const personProgress = getPersonProgress(idx);
          currentPos = getCurvedPath(
            person.startPos,
            person.targetPos,
            personProgress,
          );
        } else if (step >= 3) {
          currentPos = person.targetPos;
        }

        const borderColor = getCurrentColor(person);

        return (
          <motion.div
            key={`person-${person.id}`}
            className="absolute"
            style={{
              left: `${currentPos.x * 100}%`,
              top: `${currentPos.y * 100}%`,
              transform: "translate(-35%, 25%)",
              zIndex: 20,
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.5,
              delay: idx * 0.1,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Avatar
                className="w-14 h-14 border-4 shadow-lg transition-colors duration-500"
                style={{ borderColor }}
              >
                <AvatarImage src={person.avatarUrl} alt={person.name} />
              </Avatar>

              {/* Label */}
              <motion.div
                className="text-center text-xs font-semibold text-slate-900 bg-white px-3 py-1 rounded-full whitespace-nowrap shadow-md min-w-[160px]"
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
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 z-30${
          withDescription
            ? "  text-white bg-gradient-to-t from-slate-900/80 via-slate-900/50 to-transparent"
            : ""
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Step indicator */}
          {withDescription && (
            <>
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
            </>
          )}

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
